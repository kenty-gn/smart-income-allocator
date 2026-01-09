'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { BudgetProgress, CategoryCard, SpendingForecast, SavingsChallenge } from '@/components/dashboard';
import { AIInput, ManualInput } from '@/components/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryWithSpend, BudgetSummary } from '@/types/database';

export default function DashboardPage() {
  const { user, profile, isPro } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { transactions, addTransaction, isLoading: transactionsLoading } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const targetIncome = profile?.target_income || 300000;

  const budgetSummary: BudgetSummary = useMemo(() => {
    const fixedCosts = categories
      .filter((c) => c.type === 'fixed')
      .reduce((sum, c) => {
        const spent = transactions
          .filter((t) => t.category_id === c.id && t.type === 'expense')
          .reduce((s, t) => s + Number(t.amount), 0);
        return sum + spent;
      }, 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const disposableIncome = targetIncome - fixedCosts;

    const variableSpent = categories
      .filter((c) => c.type === 'variable')
      .reduce((sum, c) => {
        const spent = transactions
          .filter((t) => t.category_id === c.id && t.type === 'expense')
          .reduce((s, t) => s + Number(t.amount), 0);
        return sum + spent;
      }, 0);

    return {
      total_income: Math.max(totalIncome, targetIncome),
      fixed_costs: fixedCosts,
      disposable_income: disposableIncome,
      variable_spent: variableSpent,
      remaining: disposableIncome - variableSpent,
    };
  }, [categories, transactions, targetIncome]);

  const categoriesWithProgress: CategoryWithSpend[] = useMemo(() => {
    return categories.map((cat) => {
      const currentSpend = transactions
        .filter((t) => t.category_id === cat.id && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      let target = 0;
      if (cat.type === 'fixed') {
        target = cat.target_amount || currentSpend;
      } else {
        target = (cat.target_percentage || 0) / 100 * budgetSummary.disposable_income;
      }

      return {
        ...cat,
        current_spend: currentSpend,
        progress: target > 0 ? (currentSpend / target) * 100 : 0,
      };
    });
  }, [categories, transactions, budgetSummary.disposable_income]);

  const handleAddTransaction = async (data: {
    category_id: string;
    amount: number;
    date: string;
    description: string;
  }) => {
    try {
      await addTransaction({
        category_id: data.category_id,
        amount: data.amount,
        date: data.date,
        description: data.description,
        type: 'expense',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAITransactionAdd = async (
    parsed: { amount: number; category: string; description: string }[]
  ) => {
    for (const p of parsed) {
      // カテゴリ名からカテゴリIDを検索
      const category = categories.find((c) => c.name === p.category);
      if (category) {
        await addTransaction({
          category_id: category.id,
          amount: p.amount,
          date: new Date().toISOString().split('T')[0],
          description: p.description,
          type: 'expense',
        });
      }
    }
  };

  const fixedCategories = categoriesWithProgress.filter((c) => c.type === 'fixed');
  const variableCategories = categoriesWithProgress.filter((c) => c.type === 'variable');

  if (categoriesLoading || transactionsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="text-sm text-slate-500">今月の予算を確認</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
              <Plus className="mr-2 h-4 w-4" />
              支出を追加
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-200 bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900">支出を追加</DialogTitle>
            </DialogHeader>
            <ManualInput
              categories={categories}
              onTransactionAdd={handleAddTransaction}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Budget Progress */}
      <BudgetProgress summary={budgetSummary} />

      {/* AI Input */}
      <AIInput onTransactionAdd={handleAITransactionAdd} />

      {/* Spending Forecast - Pro Feature */}
      <SpendingForecast
        transactions={transactions}
        targetIncome={targetIncome}
        fixedCosts={budgetSummary.fixed_costs}
      />

      {/* Savings Challenge - Pro Feature */}
      <SavingsChallenge
        transactions={transactions}
        categories={categories}
        isPro={isPro}
      />

      {/* Fixed Costs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">固定費</h2>
        {fixedCategories.length === 0 ? (
          <p className="text-slate-500">固定費カテゴリがありません</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {fixedCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                disposableIncome={budgetSummary.disposable_income}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Variable Costs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">変動費</h2>
        {variableCategories.length === 0 ? (
          <p className="text-slate-500">変動費カテゴリがありません</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {variableCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                disposableIncome={budgetSummary.disposable_income}
                index={index + fixedCategories.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BudgetProgress, CategoryCard } from '@/components/dashboard';
import { AIInput, ManualInput } from '@/components/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  mockCategories,
  mockTransactions,
  mockProfile,
  calculateBudgetSummary,
  calculateCategoryProgress,
} from '@/lib/mock-data';
import { Transaction } from '@/types/database';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const budgetSummary = useMemo(() => {
    return calculateBudgetSummary(
      mockProfile.target_income,
      mockCategories,
      transactions
    );
  }, [transactions]);

  const categoriesWithProgress = useMemo(() => {
    return calculateCategoryProgress(
      mockCategories,
      transactions,
      budgetSummary.disposable_income
    );
  }, [transactions, budgetSummary.disposable_income]);

  const handleAddTransaction = (data: {
    category_id: string;
    amount: number;
    date: string;
    description: string;
  }) => {
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      user_id: mockProfile.id,
      category_id: data.category_id,
      amount: data.amount,
      date: data.date,
      description: data.description,
      type: 'expense',
    };
    setTransactions((prev) => [...prev, newTransaction]);
    setIsDialogOpen(false);
  };

  const handleAITransactionAdd = (
    parsed: { amount: number; category: string; description: string }[]
  ) => {
    const newTransactions = parsed.map((p) => ({
      id: `t-${Date.now()}-${Math.random()}`,
      user_id: mockProfile.id,
      category_id: p.category,
      amount: p.amount,
      date: new Date().toISOString().split('T')[0],
      description: p.description,
      type: 'expense' as const,
    }));
    setTransactions((prev) => [...prev, ...newTransactions]);
  };

  const fixedCategories = categoriesWithProgress.filter((c) => c.type === 'fixed');
  const variableCategories = categoriesWithProgress.filter((c) => c.type === 'variable');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
          <p className="text-sm text-slate-400">今月の予算を確認</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              支出を追加
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">支出を追加</DialogTitle>
            </DialogHeader>
            <ManualInput
              categories={mockCategories}
              onTransactionAdd={handleAddTransaction}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Budget Progress */}
      <BudgetProgress summary={budgetSummary} />

      {/* AI Input */}
      <AIInput onTransactionAdd={handleAITransactionAdd} />

      {/* Fixed Costs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">固定費</h2>
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
      </div>

      {/* Variable Costs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">変動費</h2>
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
      </div>
    </div>
  );
}

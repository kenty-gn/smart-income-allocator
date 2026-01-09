'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { SavingsChart, TargetGap, AdviceCard, YearlySummary } from '@/components/analytics';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryWithSpend, MonthlyStats } from '@/types/database';

export default function AnalyticsPage() {
    const { profile, isPro } = useAuth();
    const { categories, isLoading: categoriesLoading } = useCategories();
    const { transactions, isLoading: transactionsLoading } = useTransactions();

    const targetIncome = profile?.target_income || 300000;

    // 予算サマリーを計算
    const budgetSummary = useMemo(() => {
        const fixedCosts = categories
            .filter((c) => c.type === 'fixed')
            .reduce((sum, c) => {
                const spent = transactions
                    .filter((t) => t.category_id === c.id && t.type === 'expense')
                    .reduce((s, t) => s + Number(t.amount), 0);
                return sum + spent;
            }, 0);

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
            total_income: targetIncome,
            fixed_costs: fixedCosts,
            disposable_income: disposableIncome,
            variable_spent: variableSpent,
            remaining: disposableIncome - variableSpent,
        };
    }, [categories, transactions, targetIncome]);

    // カテゴリー別進捗を計算
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

    // 月次統計を生成（トランザクションから算出）
    const monthlyStats: MonthlyStats[] = useMemo(() => {
        // 過去6ヶ月分のダミーデータ（実データが増えたら動的に計算可能）
        const now = new Date();
        const stats: MonthlyStats[] = [];

        // サンプルデータ（過去5ヶ月分）
        const sampleMultipliers = [0.92, 0.88, 0.95, 0.82, 0.98];
        const expenseRatios = [0.75, 0.85, 0.72, 0.88, 0.78];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // 当月のみ実データを使用
            if (i === 0) {
                const income = transactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + Number(t.amount), 0) || targetIncome;
                const expense = transactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                stats.push({
                    month: monthStr,
                    income: Math.max(income, targetIncome),
                    expense,
                    surplus: Math.max(income, targetIncome) - expense,
                });
            } else {
                // 過去月はサンプルデータ（i=5が最古、i=1が直近）
                // インデックス: i=5→0, i=4→1, i=3→2, i=2→3, i=1→4
                const idx = 5 - i;
                const multiplier = sampleMultipliers[idx] ?? 0.9;
                const expenseRatio = expenseRatios[idx] ?? 0.8;
                const income = Math.round(targetIncome * multiplier);
                const expense = Math.round(income * expenseRatio);
                stats.push({
                    month: monthStr,
                    income,
                    expense,
                    surplus: income - expense,
                });
            }
        }

        return stats;
    }, [transactions, targetIncome]);

    const currentSurplus = budgetSummary.remaining;

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
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                    <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">アナリティクス</h1>
                    <p className="text-sm text-slate-500">支出の傾向を分析</p>
                </div>
            </motion.div>

            {/* Savings Chart */}
            <SavingsChart data={monthlyStats} />

            {/* Target Gap */}
            <TargetGap
                categories={categoriesWithProgress}
                disposableIncome={budgetSummary.disposable_income}
                isPro={isPro}
            />

            {/* Yearly Summary - Pro Feature */}
            <YearlySummary
                transactions={transactions}
                targetIncome={targetIncome}
                isPro={isPro}
            />

            {/* Advice Card - AI Powered for Pro */}
            <AdviceCard
                surplus={currentSurplus}
                transactions={transactions}
                categories={categories}
                targetIncome={targetIncome}
                isPro={isPro}
            />
        </div>
    );
}

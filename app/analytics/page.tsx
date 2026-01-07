'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { SavingsChart, TargetGap, AdviceCard } from '@/components/analytics';
import {
    mockCategories,
    mockTransactions,
    mockMonthlyStats,
    mockProfile,
    calculateBudgetSummary,
    calculateCategoryProgress,
} from '@/lib/mock-data';

export default function AnalyticsPage() {
    const budgetSummary = useMemo(() => {
        return calculateBudgetSummary(
            mockProfile.target_income,
            mockCategories,
            mockTransactions
        );
    }, []);

    const categoriesWithProgress = useMemo(() => {
        return calculateCategoryProgress(
            mockCategories,
            mockTransactions,
            budgetSummary.disposable_income
        );
    }, [budgetSummary.disposable_income]);

    // Calculate current month surplus
    const currentSurplus = budgetSummary.remaining;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">アナリティクス</h1>
                    <p className="text-sm text-slate-400">支出の傾向を分析</p>
                </div>
            </motion.div>

            {/* Savings Chart */}
            <SavingsChart data={mockMonthlyStats} />

            {/* Target Gap */}
            <TargetGap
                categories={categoriesWithProgress}
                disposableIncome={budgetSummary.disposable_income}
            />

            {/* Advice Card */}
            <AdviceCard surplus={currentSurplus} />
        </div>
    );
}

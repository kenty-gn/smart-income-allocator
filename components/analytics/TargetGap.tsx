'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { CategoryWithSpend } from '@/types/database';

interface TargetGapProps {
    categories: CategoryWithSpend[];
    disposableIncome: number;
}

export function TargetGap({ categories, disposableIncome }: TargetGapProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getTarget = (cat: CategoryWithSpend) => {
        if (cat.type === 'fixed') return cat.target_amount || 0;
        return (disposableIncome * (cat.target_percentage || 0)) / 100;
    };

    const gaps = categories.map((cat) => {
        const target = getTarget(cat);
        const gap = target - cat.current_spend;
        return {
            ...cat,
            target,
            gap,
            percentage: target > 0 ? ((target - cat.current_spend) / target) * 100 : 0,
        };
    });

    const overBudget = gaps.filter((g) => g.gap < 0);
    const underBudget = gaps.filter((g) => g.gap > 0);
    const totalSavings = underBudget.reduce((sum, g) => sum + g.gap, 0);
    const totalOverspend = Math.abs(overBudget.reduce((sum, g) => sum + g.gap, 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
        >
            <div className="mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">目標 vs 実績</h3>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400">節約中</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-400">
                        {formatCurrency(totalSavings)}
                    </p>
                    <p className="text-xs text-slate-500">{underBudget.length}カテゴリー</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">超過</span>
                    </div>
                    <p className="text-xl font-bold text-red-400">
                        {formatCurrency(totalOverspend)}
                    </p>
                    <p className="text-xs text-slate-500">{overBudget.length}カテゴリー</p>
                </div>
            </div>

            {/* Category List */}
            <div className="space-y-3">
                {gaps
                    .sort((a, b) => a.gap - b.gap)
                    .map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-sm text-white">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-sm font-medium ${cat.gap >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                >
                                    {cat.gap >= 0 ? '+' : ''}
                                    {formatCurrency(cat.gap)}
                                </span>
                                {cat.gap >= 0 ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-400" />
                                )}
                            </div>
                        </motion.div>
                    ))}
            </div>
        </motion.div>
    );
}

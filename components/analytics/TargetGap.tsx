'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Lock, Crown } from 'lucide-react';
import { CategoryWithSpend } from '@/types/database';
import { Button } from '@/components/ui/button';

interface TargetGapProps {
    categories: CategoryWithSpend[];
    disposableIncome: number;
    isPro?: boolean;
}

export function TargetGap({ categories, disposableIncome, isPro = false }: TargetGapProps) {
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
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-900">目標 vs 実績</h3>
            </div>

            {/* Summary Cards - Available for all users */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700">節約中</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(totalSavings)}
                    </p>
                    <p className="text-xs text-slate-500">{underBudget.length}カテゴリー</p>
                </div>
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                        <span className="text-sm text-rose-700">超過</span>
                    </div>
                    <p className="text-xl font-bold text-rose-600">
                        {formatCurrency(totalOverspend)}
                    </p>
                    <p className="text-xs text-slate-500">{overBudget.length}カテゴリー</p>
                </div>
            </div>

            {/* Category List - Pro Only */}
            {isPro ? (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 mb-2">カテゴリー別詳細</p>
                    {gaps
                        .sort((a, b) => a.gap - b.gap)
                        .map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="text-sm text-slate-900">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-medium ${cat.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                    >
                                        {cat.gap >= 0 ? '+' : ''}
                                        {formatCurrency(cat.gap)}
                                    </span>
                                    {cat.gap >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-rose-600" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                </div>
            ) : (
                <div className="glass-subtle rounded-xl p-5">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="mb-1 font-semibold text-slate-900">Pro機能</h4>
                        <p className="mb-3 text-sm text-slate-500">
                            各カテゴリーの目標との差額を確認できます
                        </p>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                        >
                            <Crown className="mr-2 h-4 w-4" />
                            Proにアップグレード
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}


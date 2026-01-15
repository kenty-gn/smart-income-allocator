'use client';

import { motion } from 'framer-motion';
import { Wallet, Lock, PiggyBank, TrendingUp } from 'lucide-react';
import { BudgetSummary } from '@/types/database';

interface BudgetProgressProps {
    summary: BudgetSummary;
}

export function BudgetProgress({ summary }: BudgetProgressProps) {
    const fixedPercentage = (summary.fixed_costs / summary.total_income) * 100;
    const spentPercentage = (summary.variable_spent / summary.total_income) * 100;
    const remainingPercentage = (summary.remaining / summary.total_income) * 100;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bento-item card-elevated bento-wide p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">今月の予算</h2>
                    <p className="text-sm text-slate-500">収支サマリー</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient-emerald shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="h-5 w-5 text-white" />
                </div>
            </div>

            {/* Total Income - Large Display */}
            <motion.div
                className="mb-6 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-sm text-slate-500">総収入</span>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {formatCurrency(summary.total_income)}
                </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="relative mb-6 h-4 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                    className="absolute left-0 top-0 h-full accent-gradient-rose"
                    initial={{ width: 0 }}
                    animate={{ width: `${fixedPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                <motion.div
                    className="absolute top-0 h-full accent-gradient-amber"
                    initial={{ width: 0, left: `${fixedPercentage}%` }}
                    animate={{ width: `${spentPercentage}%`, left: `${fixedPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
                <motion.div
                    className="absolute top-0 h-full accent-gradient-emerald"
                    initial={{ width: 0, left: `${fixedPercentage + spentPercentage}%` }}
                    animate={{
                        width: `${Math.max(0, remainingPercentage)}%`,
                        left: `${fixedPercentage + spentPercentage}%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                />
            </div>

            {/* Legend - Compact Grid */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    className="glass-subtle rounded-xl p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full accent-gradient-rose" />
                        <span className="text-xs text-slate-500">固定費</span>
                    </div>
                    <p className="text-sm font-bold text-rose-600">
                        {formatCurrency(summary.fixed_costs)}
                    </p>
                </motion.div>

                <motion.div
                    className="glass-subtle rounded-xl p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full accent-gradient-amber" />
                        <span className="text-xs text-slate-500">変動費</span>
                    </div>
                    <p className="text-sm font-bold text-amber-600">
                        {formatCurrency(summary.variable_spent)}
                    </p>
                </motion.div>

                <motion.div
                    className="glass-subtle rounded-xl p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full accent-gradient-emerald" />
                        <span className="text-xs text-slate-500">残り</span>
                    </div>
                    <p className={`text-sm font-bold ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(summary.remaining)}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

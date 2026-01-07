'use client';

import { motion } from 'framer-motion';
import { Wallet, Lock, PiggyBank } from 'lucide-react';
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
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">今月の予算概要</h2>

            {/* Total Income */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">総収入</span>
                    <span className="text-xl font-bold text-white">
                        {formatCurrency(summary.total_income)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-6 h-8 overflow-hidden rounded-full bg-slate-700/50">
                {/* Fixed Costs */}
                <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${fixedPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                {/* Variable Spent */}
                <motion.div
                    className="absolute top-0 h-full bg-gradient-to-r from-amber-500 to-amber-400"
                    initial={{ width: 0, left: `${fixedPercentage}%` }}
                    animate={{ width: `${spentPercentage}%`, left: `${fixedPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
                {/* Remaining */}
                <motion.div
                    className="absolute top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0, left: `${fixedPercentage + spentPercentage}%` }}
                    animate={{
                        width: `${Math.max(0, remainingPercentage)}%`,
                        left: `${fixedPercentage + spentPercentage}%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-800/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                            <Lock className="h-3 w-3 text-red-400" />
                        </div>
                        <span className="text-xs text-slate-400">固定費</span>
                    </div>
                    <motion.p
                        className="text-lg font-bold text-red-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {formatCurrency(summary.fixed_costs)}
                    </motion.p>
                </div>

                <div className="rounded-xl bg-slate-800/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
                            <Wallet className="h-3 w-3 text-amber-400" />
                        </div>
                        <span className="text-xs text-slate-400">使用済み</span>
                    </div>
                    <motion.p
                        className="text-lg font-bold text-amber-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {formatCurrency(summary.variable_spent)}
                    </motion.p>
                </div>

                <div className="rounded-xl bg-slate-800/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                            <PiggyBank className="h-3 w-3 text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-400">残り</span>
                    </div>
                    <motion.p
                        className={`text-lg font-bold ${summary.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        {formatCurrency(summary.remaining)}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

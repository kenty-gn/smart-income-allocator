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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">今月の予算概要</h2>

            {/* Total Income */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">総収入</span>
                    <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(summary.total_income)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-6 h-8 overflow-hidden rounded-full bg-slate-100">
                {/* Fixed Costs */}
                <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-rose-400"
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
                    className="absolute top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400"
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
                <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
                            <Lock className="h-3 w-3 text-rose-600" />
                        </div>
                        <span className="text-xs text-slate-600">固定費</span>
                    </div>
                    <motion.p
                        className="text-lg font-bold text-rose-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {formatCurrency(summary.fixed_costs)}
                    </motion.p>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                            <Wallet className="h-3 w-3 text-amber-600" />
                        </div>
                        <span className="text-xs text-slate-600">使用済み</span>
                    </div>
                    <motion.p
                        className="text-lg font-bold text-amber-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {formatCurrency(summary.variable_spent)}
                    </motion.p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                            <PiggyBank className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-xs text-slate-600">残り</span>
                    </div>
                    <motion.p
                        className={`text-lg font-bold ${summary.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
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

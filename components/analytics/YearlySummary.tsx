'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Lock, Crown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/database';

interface YearlySummaryProps {
    transactions: Transaction[];
    targetIncome: number;
    isPro?: boolean;
}

export function YearlySummary({ transactions, targetIncome, isPro = false }: YearlySummaryProps) {
    const yearlyStats = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // 今年のトランザクションを集計
        const yearlyIncome = transactions
            .filter((t) => {
                const date = new Date(t.date);
                return date.getFullYear() === currentYear && t.type === 'income';
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const yearlyExpense = transactions
            .filter((t) => {
                const date = new Date(t.date);
                return date.getFullYear() === currentYear && t.type === 'expense';
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // 今年の経過月数（現在月を含む）
        const monthsPassed = currentMonth + 1;

        // 目標に基づく予測
        const expectedIncome = targetIncome * monthsPassed;
        const incomeGap = yearlyIncome > 0 ? yearlyIncome - expectedIncome : 0;

        // 年間予測（現在のペースで計算）
        const projectedYearlyExpense = monthsPassed > 0
            ? (yearlyExpense / monthsPassed) * 12
            : 0;
        const projectedYearlySavings = (targetIncome * 12) - projectedYearlyExpense;

        return {
            income: yearlyIncome > 0 ? yearlyIncome : expectedIncome,
            expense: yearlyExpense,
            savings: (yearlyIncome > 0 ? yearlyIncome : expectedIncome) - yearlyExpense,
            incomeGap,
            projectedYearlySavings,
            monthsPassed,
            year: currentYear,
        };
    }, [transactions, targetIncome]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Preview data for Free users
    const previewData = {
        income: '¥???',
        expense: '¥???',
        savings: '¥???',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                        {yearlyStats.year}年 年間集計
                    </h3>
                </div>
                {!isPro && (
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                        PRO
                    </span>
                )}
            </div>

            {isPro ? (
                <>
                    {/* Stats Grid */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
                            <Wallet className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">年間収入</p>
                            <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(yearlyStats.income)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
                            <TrendingDown className="h-5 w-5 text-rose-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">年間支出</p>
                            <p className="text-lg font-bold text-rose-600">
                                {formatCurrency(yearlyStats.expense)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">年間貯蓄</p>
                            <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(yearlyStats.savings)}
                            </p>
                        </div>
                    </div>

                    {/* Projection */}
                    <div className="rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4">
                        <p className="text-sm text-slate-600 mb-1">
                            このペースでの年間貯蓄予測
                        </p>
                        <p className={`text-2xl font-bold ${yearlyStats.projectedYearlySavings >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>
                            {formatCurrency(yearlyStats.projectedYearlySavings)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {yearlyStats.monthsPassed}ヶ月経過時点での予測
                        </p>
                    </div>
                </>
            ) : (
                <div className="relative">
                    {/* Blurred Preview */}
                    <div className="grid grid-cols-3 gap-4 opacity-40 blur-sm pointer-events-none">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
                            <p className="text-xs text-slate-600 mb-1">年間収入</p>
                            <p className="text-lg font-bold text-blue-600">{previewData.income}</p>
                        </div>
                        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-center">
                            <p className="text-xs text-slate-600 mb-1">年間支出</p>
                            <p className="text-lg font-bold text-rose-600">{previewData.expense}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                            <p className="text-xs text-slate-600 mb-1">年間貯蓄</p>
                            <p className="text-lg font-bold text-emerald-600">{previewData.savings}</p>
                        </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="mb-1 font-semibold text-slate-900">年間集計</h4>
                        <p className="mb-3 text-sm text-slate-500 text-center px-4">
                            年間の収支と貯蓄予測を確認できます
                        </p>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
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

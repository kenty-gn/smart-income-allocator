'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Transaction } from '@/types/database';

interface SpendingForecastProps {
    transactions: Transaction[];
    targetIncome: number;
    fixedCosts: number;
}

export function SpendingForecast({ transactions, targetIncome, fixedCosts }: SpendingForecastProps) {
    const forecast = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - currentDay;
        const daysPassed = currentDay;

        // 今月の支出を集計
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthExpenses = transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && date >= monthStart;
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // 日平均支出
        const dailyAverage = daysPassed > 0 ? currentMonthExpenses / daysPassed : 0;

        // 月末予測支出
        const projectedMonthlyExpense = currentMonthExpenses + (dailyAverage * daysRemaining);

        // 予算（収入 - 固定費）
        const budget = targetIncome - fixedCosts;

        // 予測貯蓄
        const projectedSavings = targetIncome - projectedMonthlyExpense;

        // 予算との差
        const budgetGap = budget - projectedMonthlyExpense + fixedCosts;

        // ステータス
        let status: 'good' | 'warning' | 'danger';
        if (budgetGap >= 0) {
            status = 'good';
        } else if (budgetGap >= -20000) {
            status = 'warning';
        } else {
            status = 'danger';
        }

        return {
            currentExpense: currentMonthExpenses,
            dailyAverage,
            projectedExpense: projectedMonthlyExpense,
            projectedSavings,
            budgetGap,
            daysRemaining,
            daysPassed,
            status,
        };
    }, [transactions, targetIncome, fixedCosts]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const statusConfig = {
        good: {
            icon: CheckCircle,
            color: 'emerald',
            message: '順調です！このまま続けましょう',
            bgGradient: 'from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-200',
        },
        warning: {
            icon: AlertTriangle,
            color: 'amber',
            message: '少しペースが速めです。調整を検討しましょう',
            bgGradient: 'from-amber-50 to-orange-50',
            borderColor: 'border-amber-200',
        },
        danger: {
            icon: TrendingDown,
            color: 'rose',
            message: '予算オーバーの見込みです。支出を見直しましょう',
            bgGradient: 'from-rose-50 to-red-50',
            borderColor: 'border-rose-200',
        },
    };

    const config = statusConfig[forecast.status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.bgGradient} p-6 shadow-sm`}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${config.color}-500 shadow-lg`}>
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">月末予測</h3>
                        <p className="text-xs text-slate-500">残り{forecast.daysRemaining}日</p>
                    </div>
                </div>
                <StatusIcon className={`h-6 w-6 text-${config.color}-500`} />
            </div>

            <p className={`mb-4 text-sm text-${config.color}-700`}>{config.message}</p>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/60 p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">現在の支出</p>
                    <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(forecast.currentExpense)}
                    </p>
                </div>
                <div className="rounded-xl bg-white/60 p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">月末予測</p>
                    <p className={`text-lg font-bold text-${forecast.status === 'good' ? 'emerald' : forecast.status === 'warning' ? 'amber' : 'rose'}-600`}>
                        {formatCurrency(forecast.projectedExpense)}
                    </p>
                </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/60 p-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">予測貯蓄額</span>
                    <div className="flex items-center gap-2">
                        {forecast.projectedSavings >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        )}
                        <span className={`font-bold ${forecast.projectedSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(forecast.projectedSavings)}
                        </span>
                    </div>
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-400 text-center">
                日平均支出: {formatCurrency(forecast.dailyAverage)} / 日
            </p>
        </motion.div>
    );
}

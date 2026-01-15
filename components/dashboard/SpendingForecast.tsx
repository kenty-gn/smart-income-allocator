'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Sparkles, Lock, Crown } from 'lucide-react';
import { Transaction } from '@/types/database';
import { Button } from '@/components/ui/button';

interface SpendingForecastProps {
    transactions: Transaction[];
    targetIncome: number;
    fixedCosts: number;
    isPro?: boolean;
}

export function SpendingForecast({ transactions, targetIncome, fixedCosts, isPro = false }: SpendingForecastProps) {
    const forecast = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - currentDay;
        const daysPassed = currentDay;

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthExpenses = transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && date >= monthStart;
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const dailyAverage = daysPassed > 0 ? currentMonthExpenses / daysPassed : 0;
        const projectedMonthlyExpense = currentMonthExpenses + (dailyAverage * daysRemaining);
        const budget = targetIncome - fixedCosts;
        const projectedSavings = targetIncome - projectedMonthlyExpense;
        const budgetGap = budget - projectedMonthlyExpense + fixedCosts;

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
            message: '順調です！このまま続けましょう',
            textColor: 'text-emerald-700',
            iconColor: 'text-emerald-500',
            badgeColor: 'bg-emerald-100 text-emerald-700',
        },
        warning: {
            icon: AlertTriangle,
            message: '少しペースが速めです',
            textColor: 'text-amber-700',
            iconColor: 'text-amber-500',
            badgeColor: 'bg-amber-100 text-amber-700',
        },
        danger: {
            icon: TrendingDown,
            message: '予算オーバーの見込み',
            textColor: 'text-rose-700',
            iconColor: 'text-rose-500',
            badgeColor: 'bg-rose-100 text-rose-700',
        },
    };

    const config = statusConfig[forecast.status];
    const StatusIcon = config.icon;

    // Non-Pro: Show locked state
    if (!isPro) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-item card-elevated p-5 h-full"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient-violet shadow-lg shadow-violet-500/20">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">AI月末予測</h3>
                            <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                                <Sparkles className="h-3 w-3" /> PRO
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">残り{forecast.daysRemaining}日</p>
                    </div>
                </div>

                <div className="glass-subtle rounded-xl p-5 text-center">
                    <div className="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="mb-1 font-semibold text-slate-900">Pro機能</h4>
                    <p className="mb-3 text-sm text-slate-500">
                        AIが月末の支出を予測します
                    </p>
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                    >
                        <Crown className="mr-2 h-4 w-4" />
                        Proにアップグレード
                    </Button>
                </div>
            </motion.div>
        );
    }

    // Pro: Show full functionality
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-item glass-pro p-5 h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient-violet shadow-lg shadow-violet-500/20">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">AI月末予測</h3>
                            <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                                <Sparkles className="h-3 w-3" /> PRO
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">残り{forecast.daysRemaining}日</p>
                    </div>
                </div>
                <StatusIcon className={`h-6 w-6 ${config.iconColor}`} />
            </div>

            {/* Status Message */}
            <div className={`mb-4 rounded-lg ${config.badgeColor} px-3 py-2 text-sm font-medium`}>
                {config.message}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="glass-subtle rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">現在の支出</p>
                    <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(forecast.currentExpense)}
                    </p>
                </div>
                <div className="glass-subtle rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">月末予測</p>
                    <p className={`text-lg font-bold ${config.textColor}`}>
                        {formatCurrency(forecast.projectedExpense)}
                    </p>
                </div>
            </div>

            {/* Projected Savings */}
            <div className="mt-3 glass-subtle rounded-xl p-3">
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

            <p className="mt-2 text-xs text-slate-400 text-center">
                日平均: {formatCurrency(forecast.dailyAverage)}/日
            </p>
        </motion.div>
    );
}

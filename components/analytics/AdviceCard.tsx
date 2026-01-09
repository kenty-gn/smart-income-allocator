'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, RefreshCw, Lock, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/types/database';

interface AdviceCardProps {
    surplus: number;
    transactions?: Transaction[];
    categories?: Category[];
    targetIncome?: number;
    isPro?: boolean;
}

interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    categoryBreakdown: {
        name: string;
        amount: number;
        percentage: number;
    }[];
    topExpenseCategories: string[];
    savingsRate: number;
}

export function AdviceCard({
    surplus,
    transactions = [],
    categories = [],
    targetIncome = 300000,
    isPro = false
}: AdviceCardProps) {
    const [advice, setAdvice] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const buildSummary = useCallback((): TransactionSummary => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || targetIncome;

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // カテゴリー別集計
        const categorySpending: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'expense' && t.category_id)
            .forEach(t => {
                const cat = categories.find(c => c.id === t.category_id);
                const name = cat?.name || 'その他';
                categorySpending[name] = (categorySpending[name] || 0) + Number(t.amount);
            });

        const categoryBreakdown = Object.entries(categorySpending)
            .map(([name, amount]) => ({
                name,
                amount,
                percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        const topExpenseCategories = categoryBreakdown.slice(0, 3).map(c => c.name);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        return {
            totalIncome,
            totalExpense,
            categoryBreakdown,
            topExpenseCategories,
            savingsRate,
        };
    }, [transactions, categories, targetIncome]);

    const fetchAdvice = useCallback(async () => {
        if (!isPro) return;

        setIsLoading(true);
        try {
            const summary = buildSummary();
            const response = await fetch('/api/ai/advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary }),
            });

            if (response.ok) {
                const data = await response.json();
                setAdvice(data.advice || []);
            }
        } catch (error) {
            console.error('Error fetching advice:', error);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    }, [isPro, buildSummary]);

    useEffect(() => {
        if (isPro && !hasLoaded && transactions.length > 0) {
            fetchAdvice();
        }
    }, [isPro, hasLoaded, transactions.length, fetchAdvice]);

    // デフォルトのアドバイス（Free用 or ロード前）
    const defaultAdvice = surplus >= 10000
        ? '余剰資金を投資に回すことで、将来の資産形成に繋げられます。'
        : '固定費を見直すことで、毎月の支出を減らすことができます。';

    if (!isPro) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">基本アドバイス</h3>
                        <p className="text-xs text-slate-500">AIアドバイスはProプラン限定</p>
                    </div>
                </div>

                <p className="mb-4 text-sm text-slate-700">{defaultAdvice}</p>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                            <Lock className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                            AIがあなた専用のアドバイスを生成
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
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6"
        >
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl" />

            <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">AIアドバイス</h3>
                            <p className="text-xs text-indigo-600">あなた専用の提案</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchAdvice}
                        disabled={isLoading}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        <span className="ml-2 text-sm text-slate-600">アドバイスを生成中...</span>
                    </div>
                ) : advice.length > 0 ? (
                    <div className="space-y-3">
                        {advice.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 rounded-lg bg-white/60 border border-indigo-100 p-3"
                            >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                                    {index + 1}
                                </div>
                                <p className="text-sm text-slate-700">{item}</p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-600">
                        アドバイスを取得するには更新ボタンを押してください。
                    </p>
                )}
            </div>
        </motion.div>
    );
}

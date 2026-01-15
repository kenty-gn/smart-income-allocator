'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Zap, RefreshCw, Loader2, Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/types/database';

interface Challenge {
    title: string;
    description: string;
    target: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface SavingsChallengeProps {
    transactions: Transaction[];
    categories: Category[];
    isPro: boolean;
}

export function SavingsChallenge({ transactions, categories, isPro }: SavingsChallengeProps) {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const buildSpendingData = useCallback(() => {
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 300000;

        const categorySpending: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'expense' && t.category_id)
            .forEach(t => {
                const cat = categories.find(c => c.id === t.category_id);
                const name = cat?.name || 'その他';
                categorySpending[name] = (categorySpending[name] || 0) + Number(t.amount);
            });

        const topCategories = Object.entries(categorySpending)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

        return {
            totalExpense,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
            topCategories,
        };
    }, [transactions, categories]);

    const fetchChallenges = useCallback(async () => {
        if (!isPro) return;

        setIsLoading(true);
        try {
            const data = buildSpendingData();
            const response = await fetch('/api/ai/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }),
            });

            if (response.ok) {
                const result = await response.json();
                setChallenges(result.challenges || []);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    }, [isPro, buildSpendingData]);

    useEffect(() => {
        if (isPro && !hasLoaded && transactions.length > 0) {
            fetchChallenges();
        }
    }, [isPro, hasLoaded, transactions.length, fetchChallenges]);

    const difficultyConfig = {
        easy: {
            icon: Star,
            label: '初級',
            className: 'bg-emerald-50 border-emerald-200 text-emerald-600',
        },
        medium: {
            icon: Flame,
            label: '中級',
            className: 'bg-amber-50 border-amber-200 text-amber-600',
        },
        hard: {
            icon: Zap,
            label: '上級',
            className: 'bg-rose-50 border-rose-200 text-rose-600',
        },
    };

    // Non-Pro View
    if (!isPro) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-item card-elevated p-5 h-full"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient-amber shadow-lg shadow-amber-500/20">
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">節約チャレンジ</h3>
                        <p className="text-xs text-slate-500">週間目標を達成しよう</p>
                    </div>
                </div>

                <div className="glass-subtle rounded-xl p-5 text-center">
                    <div className="mb-3 flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="mb-1 font-semibold text-slate-900">Pro機能</h4>
                    <p className="mb-3 text-sm text-slate-500">
                        AIがあなた専用のチャレンジを提案
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

    // Pro View
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-item glass-pro p-5 h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient-amber shadow-lg shadow-amber-500/20">
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">今週のチャレンジ</h3>
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Sparkles className="h-3 w-3" /> PRO
                            </span>
                        </div>
                        <p className="text-xs text-amber-700">達成して節約力アップ！</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchChallenges}
                    disabled={isLoading}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 rounded-lg"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                    <span className="ml-2 text-sm text-slate-600">チャレンジを生成中...</span>
                </div>
            ) : challenges.length > 0 ? (
                <div className="space-y-2">
                    {challenges.map((challenge, index) => {
                        const config = difficultyConfig[challenge.difficulty];
                        const Icon = config.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-subtle rounded-xl p-3"
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
                                            <Icon className="h-3 w-3" />
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">{challenge.target}</span>
                                </div>
                                <h4 className="font-medium text-slate-900 text-sm">{challenge.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{challenge.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-subtle rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600">
                        更新ボタンを押してチャレンジを取得しましょう！
                    </p>
                </div>
            )}
        </motion.div>
    );
}

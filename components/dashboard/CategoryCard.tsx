'use client';

import { motion } from 'framer-motion';
import { CategoryWithSpend } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    category: CategoryWithSpend;
    disposableIncome: number;
    index: number;
}

export function CategoryCard({ category, disposableIncome, index }: CategoryCardProps) {
    const target =
        category.type === 'fixed'
            ? category.target_amount || 0
            : (disposableIncome * (category.target_percentage || 0)) / 100;

    const isOverBudget = category.progress > 100;
    const progressColor = isOverBudget
        ? 'from-red-500 to-red-600'
        : category.progress > 80
            ? 'from-amber-500 to-orange-500'
            : 'from-indigo-500 to-purple-500';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/50 p-4 transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5"
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${category.color}20` }}
                    >
                        <div
                            className="flex h-full w-full items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${category.color}30` }}
                        >
                            <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-white">{category.name}</h3>
                        <span className="text-xs text-slate-500">
                            {category.type === 'fixed' ? '固定費' : '変動費'}
                        </span>
                    </div>
                </div>
                <div className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    isOverBudget ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                )}>
                    {Math.round(category.progress)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-700/50">
                <motion.div
                    className={cn('h-full rounded-full bg-gradient-to-r', progressColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(category.progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
                />
            </div>

            {/* Amounts */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                    {formatCurrency(category.current_spend)}
                </span>
                <span className="text-slate-500">/ {formatCurrency(target)}</span>
            </div>
        </motion.div>
    );
}

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
        ? 'accent-gradient-rose'
        : category.progress > 80
            ? 'accent-gradient-amber'
            : 'accent-gradient-emerald';

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
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="bento-item card-elevated p-4"
        >
            <div className="flex items-center gap-3 mb-3">
                {/* Color Indicator */}
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                >
                    <div
                        className="h-5 w-5 rounded-lg"
                        style={{ backgroundColor: category.color }}
                    />
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{category.name}</h3>
                    <span className="text-xs text-slate-500">
                        {category.type === 'fixed' ? '固定費' : '変動費'}
                    </span>
                </div>

                {/* Percentage Badge */}
                <div className={cn(
                    'flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    isOverBudget
                        ? 'bg-rose-100 text-rose-700'
                        : category.progress > 80
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                )}>
                    {Math.round(category.progress)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                    className={cn('h-full rounded-full', progressColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(category.progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
                />
            </div>

            {/* Amount Display */}
            <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">
                    {formatCurrency(category.current_spend)}
                </span>
                <span className="text-sm text-slate-400">
                    / {formatCurrency(target)}
                </span>
            </div>
        </motion.div>
    );
}

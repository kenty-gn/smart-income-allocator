'use client';

import { ReactNode, useMemo } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { isPro, profile } = useAuth();
    const { transactions } = useTransactions();
    const { categories } = useCategories();

    const chatContext = useMemo(() => {
        const targetIncome = profile?.target_income || 300000;

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || targetIncome;

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const categorySpending: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'expense' && t.category_id)
            .forEach(t => {
                const cat = categories.find(c => c.id === t.category_id);
                const name = cat?.name || 'その他';
                categorySpending[name] = (categorySpending[name] || 0) + Number(t.amount);
            });

        const categoryBreakdown = Object.entries(categorySpending)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        return {
            totalIncome,
            totalExpense,
            savings: totalIncome - totalExpense,
            categoryBreakdown,
        };
    }, [transactions, categories, profile?.target_income]);

    return (
        <div className="min-h-screen bg-gradient-soft">
            <Header />
            <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
                {children}
            </main>
            <MobileNav />
            <AIChatWidget context={chatContext} isPro={isPro} />
        </div>
    );
}


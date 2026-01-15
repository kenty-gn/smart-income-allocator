'use client';

/**
 * useTransactions.ts - 取引データを管理するカスタムフック
 * 
 * 【責務】
 * - 取引（収入・支出）のCRUD操作
 * - リアルタイム同期
 * - フィルタリング（期間、種別、カテゴリ）
 * 
 * 【使用方法】
 * // 全取引を取得
 * const { transactions, addTransaction } = useTransactions();
 * 
 * // 今月の支出のみ取得
 * const { transactions } = useTransactions({
 *   startDate: '2026-01-01',
 *   endDate: '2026-01-31',
 *   type: 'expense',
 * });
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, TransactionType } from '@/types/database';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyStats,
} from '@/lib/api/transactions';
import { subscribeToTransactions, unsubscribe } from '@/lib/realtime';

/**
 * トランザクションにカテゴリ情報を付加した型
 * 
 * JOINで取得したカテゴリ名・色を保持する。
 * 一覧表示でカテゴリ名を表示するために使用。
 */
interface TransactionWithCategory extends Transaction {
    categories?: {
        name: string;
        color: string;
    };
}

/**
 * useTransactionsのオプション
 * 
 * フィルタ条件を指定して取得データを絞り込む。
 * フックの引数が変わると自動的に再取得される。
 */
interface UseTransactionsOptions {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    categoryId?: string;
    limit?: number;
}

/**
 * トランザクションを管理するメインフック
 */
export function useTransactions(options?: UseTransactionsOptions) {
    const { user, isLoading: authLoading } = useAuth();
    const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    const fetchTransactions = useCallback(async () => {
        // 認証のロードが完了するまで待つ
        if (authLoading) {
            return;
        }

        if (!user) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await getTransactions(user.id, options);
            setTransactions(data as TransactionWithCategory[]);
        } catch (err) {
            console.error('Error in useTransactions:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading, options?.startDate, options?.endDate, options?.type, options?.categoryId, options?.limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // リアルタイム購読
    useEffect(() => {
        if (!user) return;

        const channel = subscribeToTransactions(user.id, {
            onInsert: (newTransaction) => {
                setTransactions((prev) => {
                    // 重複チェック
                    if (prev.some((t) => t.id === newTransaction.id)) return prev;
                    return [newTransaction as TransactionWithCategory, ...prev];
                });
            },
            onUpdate: (updatedTransaction) => {
                setTransactions((prev) =>
                    prev.map((t) =>
                        t.id === updatedTransaction.id
                            ? { ...t, ...updatedTransaction }
                            : t
                    )
                );
            },
            onDelete: (deletedTransaction) => {
                setTransactions((prev) =>
                    prev.filter((t) => t.id !== deletedTransaction.id)
                );
            },
        });

        return () => {
            unsubscribe(channel);
        };
    }, [user]);

    const addTransaction = async (data: {
        category_id?: string;
        amount: number;
        date: string;
        description?: string;
        type: TransactionType;
    }) => {
        if (!user) throw new Error('User not authenticated');

        const newTransaction = await createTransaction({
            user_id: user.id,
            ...data,
        });

        // リストを再取得して最新状態に更新
        await fetchTransactions();
        return newTransaction;
    };

    const editTransaction = async (
        id: string,
        data: Partial<Omit<Transaction, 'id' | 'user_id'>>
    ) => {
        const updated = await updateTransaction(id, data);
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
        return updated;
    };

    const removeTransaction = async (id: string) => {
        await deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    return {
        transactions,
        isLoading,
        error,
        refetch: fetchTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
    };
}

// 月間統計フック
export function useMonthlyStats(year: number, month: number) {
    const { user } = useAuth();
    const [stats, setStats] = useState({ income: 0, expense: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStats = useCallback(async () => {
        if (!user) {
            setStats({ income: 0, expense: 0 });
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await getMonthlyStats(user.id, year, month);
            setStats(data);
        } catch (err) {
            console.error('Error in useMonthlyStats:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [user, year, month]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        ...stats,
        surplus: stats.income - stats.expense,
        isLoading,
        error,
        refetch: fetchStats,
    };
}

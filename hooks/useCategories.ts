'use client';

/**
 * useCategories.ts - カテゴリデータを管理するカスタムフック
 * 
 * 【責務】
 * - カテゴリのCRUD操作
 * - リアルタイム同期（他デバイスでの変更を即座に反映）
 * - 初回利用時のデフォルトカテゴリ自動作成
 * 
 * 【使用方法】
 * const { categories, addCategory, removeCategory } = useCategories();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types/database';
import {
    getCategories,
    createCategory,
    createDefaultCategories,
    hasCategories,
    deleteCategory,
    updateCategory,
} from '@/lib/api/categories';
import { subscribeToCategories, unsubscribe } from '@/lib/realtime';

/**
 * カテゴリを管理するフック
 * 
 * 認証済みユーザーのカテゴリを取得し、リアルタイムで同期する。
 * 初回ログイン時にデフォルトカテゴリを自動作成する。
 * 
 * @returns categories - カテゴリ一覧
 * @returns fixedCategories - 固定費カテゴリ（家賃、通信費など）
 * @returns variableCategories - 変動費カテゴリ（食費、娯楽など）
 */
export function useCategories() {
    const { user, isLoading: authLoading } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    const fetchCategories = useCallback(async () => {
        // 認証のロードが完了するまで待つ
        if (authLoading) {
            return;
        }

        if (!user) {
            setCategories([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // カテゴリが存在しない場合はデフォルトカテゴリを作成
            const exists = await hasCategories(user.id);

            if (!exists) {
                await createDefaultCategories(user.id);
            }

            const data = await getCategories(user.id);
            setCategories(data);
        } catch (err) {
            console.error('Error in useCategories:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // リアルタイム購読
    useEffect(() => {
        if (!user) return;

        const channel = subscribeToCategories(user.id, {
            onInsert: (newCategory) => {
                setCategories((prev) => {
                    // 重複チェック
                    if (prev.some((c) => c.id === newCategory.id)) return prev;
                    return [...prev, newCategory];
                });
            },
            onUpdate: (updatedCategory) => {
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === updatedCategory.id
                            ? { ...c, ...updatedCategory }
                            : c
                    )
                );
            },
            onDelete: (deletedCategory) => {
                setCategories((prev) =>
                    prev.filter((c) => c.id !== deletedCategory.id)
                );
            },
        });

        return () => {
            unsubscribe(channel);
        };
    }, [user]);

    const addCategory = async (data: {
        name: string;
        type: 'fixed' | 'variable';
        target_amount?: number;
        target_percentage?: number;
        color?: string;
    }) => {
        if (!user) throw new Error('User not authenticated');

        const newCategory = await createCategory({
            user_id: user.id,
            ...data,
        });
        setCategories((prev) => [...prev, newCategory]);
        return newCategory;
    };

    const editCategory = async (
        id: string,
        data: {
            name?: string;
            type?: 'fixed' | 'variable';
            target_amount?: number | null;
            target_percentage?: number | null;
            color?: string;
        }
    ) => {
        const updated = await updateCategory(id, data);
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
        );
        return updated;
    };

    const removeCategory = async (id: string) => {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    const fixedCategories = categories.filter((c) => c.type === 'fixed');
    const variableCategories = categories.filter((c) => c.type === 'variable');

    return {
        categories,
        fixedCategories,
        variableCategories,
        isLoading,
        error,
        refetch: fetchCategories,
        addCategory,
        editCategory,
        removeCategory,
    };
}


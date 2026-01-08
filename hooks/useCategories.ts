'use client';

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

export function useCategories() {
    const { user, isLoading: authLoading } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCategories = useCallback(async () => {
        console.log('[useCategories] fetchCategories called', { authLoading, userId: user?.id });

        // 認証のロードが完了するまで待つ
        if (authLoading) {
            console.log('[useCategories] Still loading auth, skipping fetch');
            return;
        }

        if (!user) {
            console.log('[useCategories] No user, setting empty categories');
            setCategories([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // カテゴリが存在しない場合はデフォルトカテゴリを作成
            console.log('[useCategories] Checking if categories exist for user', user.id);
            const exists = await hasCategories(user.id);
            console.log('[useCategories] Categories exist:', exists);

            if (!exists) {
                console.log('[useCategories] Creating default categories');
                await createDefaultCategories(user.id);
            }

            console.log('[useCategories] Fetching categories');
            const data = await getCategories(user.id);
            console.log('[useCategories] Fetched categories:', data);
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


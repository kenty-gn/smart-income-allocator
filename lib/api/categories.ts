import { supabase } from '@/lib/supabase';
import { Category, CategoryType } from '@/types/database';

// カテゴリ取得
export async function getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }

    return data || [];
}

// カテゴリ作成
export async function createCategory(data: {
    user_id: string;
    name: string;
    type: CategoryType;
    target_amount?: number;
    target_percentage?: number;
    color?: string;
}): Promise<Category> {
    const { data: category, error } = await supabase
        .from('categories')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        throw error;
    }

    return category;
}

// デフォルトカテゴリ作成
export async function createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
        // 固定費
        { user_id: userId, name: '家賃', type: 'fixed' as CategoryType, color: '#ef4444' },
        { user_id: userId, name: '水道光熱費', type: 'fixed' as CategoryType, color: '#f97316' },
        { user_id: userId, name: '通信費', type: 'fixed' as CategoryType, color: '#eab308' },
        { user_id: userId, name: '保険', type: 'fixed' as CategoryType, color: '#22c55e' },
        { user_id: userId, name: 'サブスクリプション', type: 'fixed' as CategoryType, color: '#06b6d4' },
        // 変動費
        { user_id: userId, name: '食費', type: 'variable' as CategoryType, target_percentage: 15, color: '#8b5cf6' },
        { user_id: userId, name: '交通費', type: 'variable' as CategoryType, target_percentage: 5, color: '#ec4899' },
        { user_id: userId, name: '娯楽', type: 'variable' as CategoryType, target_percentage: 10, color: '#6366f1' },
        { user_id: userId, name: '日用品', type: 'variable' as CategoryType, target_percentage: 5, color: '#14b8a6' },
        { user_id: userId, name: 'その他', type: 'variable' as CategoryType, target_percentage: 10, color: '#64748b' },
    ];

    const { error } = await supabase
        .from('categories')
        .insert(defaultCategories);

    if (error) {
        console.error('Error creating default categories:', error);
        throw error;
    }
}

// カテゴリ更新
export async function updateCategory(
    id: string,
    data: Partial<Omit<Category, 'id' | 'user_id'>>
): Promise<Category> {
    const { data: category, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category:', error);
        throw error;
    }

    return category;
}

// カテゴリ削除
export async function deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

// カテゴリの存在確認
export async function hasCategories(userId: string): Promise<boolean> {
    const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (error) {
        console.error('Error checking categories:', error);
        return false;
    }

    return (count || 0) > 0;
}

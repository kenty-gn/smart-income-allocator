/**
 * categories.ts - カテゴリAPI
 * 
 * 【責務】
 * - Supabaseとのデータ通信
 * - カテゴリのCRUD操作
 * - デフォルトカテゴリの初期化
 * 
 * 【設計方針】
 * - 各関数は単一の責務を持つ
 * - エラーは呼び出し元に伝播させる（ここではログのみ）
 * - 戻り値は型安全なオブジェクト
 */

import { supabase } from '@/lib/supabase';
import { Category, CategoryType } from '@/types/database';

// ========================================
// カテゴリ取得
// ========================================

/**
 * ユーザーのカテゴリ一覧を取得
 * 
 * タイプ順（固定費→変動費）、名前順でソートして返す。
 * ダッシュボードでの表示順序を統一するため。
 */
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


// ========================================
// カテゴリ作成
// ========================================

/**
 * 新規カテゴリを作成
 * 
 * @param data.type - 'fixed'(固定費) または 'variable'(変動費)
 * @param data.target_amount - 固定費の場合の目標金額（例: 家賃 80,000円）
 * @param data.target_percentage - 変動費の場合の目標割合（例: 食費 15%）
 */
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

// ========================================
// デフォルトカテゴリ
// ========================================

/**
 * デフォルトカテゴリを一括作成
 * 
 * 新規ユーザーが初めてログインしたときに呼び出される。
 * 一般的な支出カテゴリをプリセットし、すぐに使い始められるようにする。
 * 
 * 【固定費】家賃、水道光熱費、通信費、保険、サブスク
 * 【変動費】食費(15%)、交通費(5%)、娯楽(10%)、日用品(5%)、その他(10%)
 */
export async function createDefaultCategories(userId: string): Promise<void> {
    // カラーはTailwind CSSの色を使用し、グラフでの視認性を確保
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

// ========================================
// カテゴリ更新・削除
// ========================================

/**
 * カテゴリ情報を更新
 * 
 * 名前、カラー、目標金額等を部分的に更新できる。
 * idとuser_idはセキュリティのため変更不可。
 */
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

/**
 * カテゴリを削除
 * 
 * 注意: このカテゴリに紐づく取引は残るが、
 * カテゴリ名が表示されなくなる。
 */
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

// ========================================
// ユーティリティ
// ========================================

/**
 * ユーザーがカテゴリを持っているか確認
 * 
 * 初回ログインかどうかの判定に使用。
 * countのみ取得し、データ本体は取得しない（パフォーマンス最適化）。
 */
export async function hasCategories(userId: string): Promise<boolean> {
    // head: true でデータ本体を取得せず、countのみ得る
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

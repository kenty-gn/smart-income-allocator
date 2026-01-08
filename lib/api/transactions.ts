import { supabase } from '@/lib/supabase';
import { Transaction, TransactionType } from '@/types/database';

interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    type?: TransactionType;
    categoryId?: string;
    limit?: number;
}

// トランザクション取得
export async function getTransactions(
    userId: string,
    filters?: TransactionFilters
): Promise<Transaction[]> {
    let query = supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
    }
    if (filters?.type) {
        query = query.eq('type', filters.type);
    }
    if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }

    return data || [];
}

// トランザクション作成
export async function createTransaction(data: {
    user_id: string;
    category_id?: string;
    amount: number;
    date: string;
    description?: string;
    type: TransactionType;
}): Promise<Transaction> {
    const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }

    return transaction;
}

// トランザクション更新
export async function updateTransaction(
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'user_id'>>
): Promise<Transaction> {
    const { data: transaction, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }

    return transaction;
}

// トランザクション削除
export async function deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

// 月間集計
export async function getMonthlyStats(
    userId: string,
    year: number,
    month: number
): Promise<{ income: number; expense: number }> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        console.error('Error fetching monthly stats:', error);
        throw error;
    }

    const stats = { income: 0, expense: 0 };
    data?.forEach((t) => {
        if (t.type === 'income') {
            stats.income += Number(t.amount);
        } else {
            stats.expense += Number(t.amount);
        }
    });

    return stats;
}

// カテゴリ別支出集計
export async function getCategorySpending(
    userId: string,
    startDate: string,
    endDate: string
): Promise<{ category_id: string; total: number }[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        console.error('Error fetching category spending:', error);
        throw error;
    }

    // カテゴリ別に集計
    const spending: Record<string, number> = {};
    data?.forEach((t) => {
        if (t.category_id) {
            spending[t.category_id] = (spending[t.category_id] || 0) + Number(t.amount);
        }
    });

    return Object.entries(spending).map(([category_id, total]) => ({
        category_id,
        total,
    }));
}

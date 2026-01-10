import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Transaction, Category } from '@/types/database';

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimeCallbacks<T> {
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (record: T) => void;
}

/**
 * トランザクションの変更をリアルタイムで購読
 */
export function subscribeToTransactions(
    userId: string,
    callbacks: RealtimeCallbacks<Transaction>
): RealtimeChannel {
    const channel = supabase
        .channel(`transactions-${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: `user_id=eq.${userId}`,
            },
            (payload: RealtimePostgresChangesPayload<Transaction>) => {
                const eventType = payload.eventType as ChangeEvent;

                switch (eventType) {
                    case 'INSERT':
                        callbacks.onInsert?.(payload.new as Transaction);
                        break;
                    case 'UPDATE':
                        callbacks.onUpdate?.(payload.new as Transaction);
                        break;
                    case 'DELETE':
                        callbacks.onDelete?.(payload.old as Transaction);
                        break;
                }
            }
        )
        .subscribe();

    return channel;
}

/**
 * カテゴリーの変更をリアルタイムで購読
 */
export function subscribeToCategories(
    userId: string,
    callbacks: RealtimeCallbacks<Category>
): RealtimeChannel {
    const channel = supabase
        .channel(`categories-${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'categories',
                filter: `user_id=eq.${userId}`,
            },
            (payload: RealtimePostgresChangesPayload<Category>) => {
                const eventType = payload.eventType as ChangeEvent;

                switch (eventType) {
                    case 'INSERT':
                        callbacks.onInsert?.(payload.new as Category);
                        break;
                    case 'UPDATE':
                        callbacks.onUpdate?.(payload.new as Category);
                        break;
                    case 'DELETE':
                        callbacks.onDelete?.(payload.old as Category);
                        break;
                }
            }
        )
        .subscribe();

    return channel;
}

/**
 * チャンネルの購読を解除
 */
export function unsubscribe(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
}

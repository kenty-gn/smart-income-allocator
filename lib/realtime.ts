/**
 * realtime.ts - Supabaseリアルタイム同期
 * 
 * 【責務】
 * - PostgreSQLの変更をWebSocketで受信
 * - 他デバイス・他タブでの変更を即座に反映
 * 
 * 【仕組み】
 * Supabaseのリアルタイム機能はPostgreSQLのWAL(Write-Ahead Log)を
 * 監視し、変更があるとWebSocketで通知する。
 * 
 * 【使用例】
 * const channel = subscribeToTransactions(userId, {
 *   onInsert: (tx) => setTransactions(prev => [...prev, tx]),
 *   onDelete: (tx) => setTransactions(prev => prev.filter(t => t.id !== tx.id)),
 * });
 * return () => unsubscribe(channel);  // クリーンアップ
 */

import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Transaction, Category } from '@/types/database';

/** PostgreSQLの変更イベント種別 */
type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * リアルタイムイベントのコールバック定義
 * 
 * 必要なイベントのみ定義すればよい（オプショナル）。
 */
interface RealtimeCallbacks<T> {
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (record: T) => void;
}

// ========================================
// トランザクション購読
// ========================================

/**
 * トランザクションの変更をリアルタイムで購読
 * 
 * user_idでフィルタリングし、自分の取引のみ受信する。
 * 返り値のchannelは、コンポーネントのアンマウント時にunsubscribe()で解除する。
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
                event: '*',  // INSERT, UPDATE, DELETEすべてを購読
                schema: 'public',
                table: 'transactions',
                filter: `user_id=eq.${userId}`,  // RLS的なフィルタリング
            },
            (payload: RealtimePostgresChangesPayload<Transaction>) => {
                const eventType = payload.eventType as ChangeEvent;

                // イベント種別に応じて適切なコールバックを呼び出し
                switch (eventType) {
                    case 'INSERT':
                        callbacks.onInsert?.(payload.new as Transaction);
                        break;
                    case 'UPDATE':
                        callbacks.onUpdate?.(payload.new as Transaction);
                        break;
                    case 'DELETE':
                        // DELETEではpayload.newは空なのでoldを使用
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

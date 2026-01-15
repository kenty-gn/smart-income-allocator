'use client';

/**
 * AuthContext.tsx - 認証状態を管理するContext
 * 
 * 【責務】
 * - Supabase認証との連携
 * - ユーザー情報とプロフィールの保持
 * - Proプラン判定ロジック
 * 
 * 【使用方法】
 * const { user, isPro, signOut } = useAuth();
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

/**
 * 認証Contextが提供する値の型定義
 * 
 * user: Supabaseのユーザーオブジェクト
 * profile: アプリ固有のプロフィール情報（給料日、目標収入など）
 * isPro: Proプラン加入状態（課金判定に使用）
 */
interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isPro: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダー
 * 
 * アプリ全体をラップして認証状態を提供する。
 * layout.tsxで使用し、全ページから認証情報にアクセス可能にする。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 開発者アカウントは無料でPro機能を利用可能
    // 新しいメールを追加する場合はここに追記
    const FREE_PRO_EMAILS = ['sawayakakenty@gmail.com'];


    /**
     * プロフィール取得
     * 
     * DBからプロフィールを取得し、必要に応じてProプランを自動付与する。
     * FREE_PRO_EMAILSのアカウントは、初回ログイン時に自動でProになる。
     * 
     * @param userId - SupabaseのユーザーID
     * @param userEmail - 無料Pro判定に使用するメールアドレス
     */
    const fetchProfile = async (userId: string, userEmail?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            const profileData = data as Profile;

            // 特定アカウントで、まだfreeの場合は自動でProに設定
            if (userEmail && FREE_PRO_EMAILS.includes(userEmail) && profileData.subscription_tier === 'free') {
                const { data: updated } = await supabase
                    .from('profiles')
                    .update({ subscription_tier: 'pro' })
                    .eq('id', userId)
                    .select()
                    .single();
                if (updated) {
                    return updated as Profile;
                }
            }

            return profileData;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };

    /**
     * プロフィールを再取得
     * 
     * 設定変更後やStripe決済完了後に呼び出し、最新のプロフィールを反映する。
     */
    const refreshProfile = async () => {
        if (user) {
            const newProfile = await fetchProfile(user.id, user.email || undefined);
            setProfile(newProfile);
        }
    };

    // ========================================
    // 初期化とリスナー設定
    // ========================================

    useEffect(() => {
        // 初回マウント時にlocalStorageからセッションを復元
        // ネットワーク通信なしで即座にログイン状態を判定できる
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                fetchProfile(currentSession.user.id, currentSession.user.email || undefined).then(setProfile);
            }
            setIsLoading(false);
        });

        // 認証状態変更のリスナー（ログイン/ログアウト/トークン更新）
        // 他のタブでのログアウトも検知できる
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
                const userProfile = await fetchProfile(newSession.user.id, newSession.user.email || undefined);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    /**
     * ログアウト処理
     * 
     * Supabaseのセッションを破棄し、ローカルの状態をクリアする。
     * ログインページへのリダイレクトはmiddleware.tsが自動で行う。
     */
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    // isPro: subscription_tierが'pro'かどうかで判定
    // Stripe連携後は、Webhookでsubscription_tierが更新される
    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isPro: profile?.subscription_tier === 'pro',
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * 認証情報を取得するカスタムフック
 * 
 * 【使用例】
 * ```tsx
 * const { user, isPro, signOut } = useAuth();
 * 
 * if (!user) return <LoginPage />;
 * if (isPro) return <ProFeature />;
 * ```
 * 
 * @throws AuthProvider外で使用するとエラー
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

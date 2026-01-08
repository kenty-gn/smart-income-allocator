'use client';

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
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
            return data as Profile;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const newProfile = await fetchProfile(user.id);
            setProfile(newProfile);
        }
    };

    useEffect(() => {
        // Get initial session - use getSession which doesn't require a network call
        // if there's a valid session in localStorage
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            console.log('[AuthContext] Initial session:', currentSession?.user?.id || 'null');
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                fetchProfile(currentSession.user.id).then(setProfile);
            }
            setIsLoading(false);
        });

        // Listen for auth changes - this is the primary source of truth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('[AuthContext] Auth state change:', event, newSession?.user?.id || 'null');
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
                const userProfile = await fetchProfile(newSession.user.id);
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

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Profile } from '@/types/database';
import { mockProfile } from '@/lib/mock-data';

interface AuthContextType {
    user: Profile | null;
    isLoading: boolean;
    isPro: boolean;
    toggleSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Profile>(mockProfile);
    const [isLoading] = useState(false);

    const toggleSubscription = () => {
        setUser((prev) => ({
            ...prev,
            subscription_tier: prev.subscription_tier === 'free' ? 'pro' : 'free',
        }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isPro: user?.subscription_tier === 'pro',
                toggleSubscription,
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

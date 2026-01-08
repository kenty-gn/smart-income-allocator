import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

// プロフィール取得
export async function getProfile(userId: string): Promise<Profile | null> {
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
}

// プロフィール更新
export async function updateProfile(
    userId: string,
    data: Partial<Omit<Profile, 'id'>>
): Promise<Profile | null> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return null;
    }

    return profile as Profile;
}

// 目標収入を更新
export async function updateTargetIncome(
    userId: string,
    targetIncome: number
): Promise<Profile | null> {
    return updateProfile(userId, { target_income: targetIncome });
}

// 給料日を更新
export async function updateSalaryDay(
    userId: string,
    salaryDay: number
): Promise<Profile | null> {
    if (salaryDay < 1 || salaryDay > 31) {
        console.error('Invalid salary day:', salaryDay);
        return null;
    }
    return updateProfile(userId, { salary_day: salaryDay });
}

// サブスクリプションティア更新
export async function updateSubscriptionTier(
    userId: string,
    tier: 'free' | 'pro'
): Promise<Profile | null> {
    return updateProfile(userId, { subscription_tier: tier });
}

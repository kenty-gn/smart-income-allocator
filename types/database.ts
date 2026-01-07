export type SubscriptionTier = 'free' | 'pro';
export type CategoryType = 'fixed' | 'variable';
export type TransactionType = 'income' | 'expense';

export interface Profile {
  id: string;
  salary_day: number;
  target_income: number;
  subscription_tier: SubscriptionTier;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  target_amount: number | null;
  target_percentage: number | null;
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
}

// Extended types with computed fields
export interface CategoryWithSpend extends Category {
  current_spend: number;
  progress: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  surplus: number;
}

export interface BudgetSummary {
  total_income: number;
  fixed_costs: number;
  disposable_income: number;
  variable_spent: number;
  remaining: number;
}

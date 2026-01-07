import { Profile, Category, Transaction, MonthlyStats, BudgetSummary, CategoryWithSpend } from '@/types/database';

export const mockProfile: Profile = {
    id: 'user-1',
    salary_day: 25,
    target_income: 350000,
    subscription_tier: 'free',
};

export const mockCategories: Category[] = [
    { id: 'cat-1', user_id: 'user-1', name: '家賃', type: 'fixed', target_amount: 85000, target_percentage: null, color: '#6366f1' },
    { id: 'cat-2', user_id: 'user-1', name: '光熱費', type: 'fixed', target_amount: 15000, target_percentage: null, color: '#f59e0b' },
    { id: 'cat-3', user_id: 'user-1', name: '通信費', type: 'fixed', target_amount: 10000, target_percentage: null, color: '#10b981' },
    { id: 'cat-4', user_id: 'user-1', name: 'サブスク', type: 'fixed', target_amount: 5000, target_percentage: null, color: '#8b5cf6' },
    { id: 'cat-5', user_id: 'user-1', name: '食費', type: 'variable', target_amount: null, target_percentage: 30, color: '#ef4444' },
    { id: 'cat-6', user_id: 'user-1', name: '趣味', type: 'variable', target_amount: null, target_percentage: 20, color: '#3b82f6' },
    { id: 'cat-7', user_id: 'user-1', name: '交通費', type: 'variable', target_amount: null, target_percentage: 15, color: '#ec4899' },
    { id: 'cat-8', user_id: 'user-1', name: '貯蓄', type: 'variable', target_amount: null, target_percentage: 35, color: '#14b8a6' },
];

export const mockTransactions: Transaction[] = [
    { id: 't-1', user_id: 'user-1', category_id: 'cat-1', amount: 85000, date: '2026-01-05', description: '1月家賃', type: 'expense' },
    { id: 't-2', user_id: 'user-1', category_id: 'cat-2', amount: 12000, date: '2026-01-06', description: '電気・ガス', type: 'expense' },
    { id: 't-3', user_id: 'user-1', category_id: 'cat-5', amount: 15000, date: '2026-01-03', description: 'スーパー', type: 'expense' },
    { id: 't-4', user_id: 'user-1', category_id: 'cat-5', amount: 3200, date: '2026-01-05', description: 'コンビニ', type: 'expense' },
    { id: 't-5', user_id: 'user-1', category_id: 'cat-6', amount: 8000, date: '2026-01-04', description: 'ゲーム購入', type: 'expense' },
    { id: 't-6', user_id: 'user-1', category_id: 'cat-7', amount: 5000, date: '2026-01-02', description: '定期券', type: 'expense' },
    { id: 't-income-1', user_id: 'user-1', category_id: '', amount: 350000, date: '2025-12-25', description: '12月給与', type: 'income' },
];

export const mockMonthlyStats: MonthlyStats[] = [
    { month: '2025-07', income: 350000, expense: 280000, surplus: 70000 },
    { month: '2025-08', income: 350000, expense: 310000, surplus: 40000 },
    { month: '2025-09', income: 350000, expense: 275000, surplus: 75000 },
    { month: '2025-10', income: 380000, expense: 320000, surplus: 60000 },
    { month: '2025-11', income: 350000, expense: 365000, surplus: -15000 },
    { month: '2025-12', income: 700000, expense: 450000, surplus: 250000 },
];

// Calculate budget summary
export function calculateBudgetSummary(
    income: number,
    categories: Category[],
    transactions: Transaction[]
): BudgetSummary {
    const fixedCategories = categories.filter((c) => c.type === 'fixed');
    const fixedCosts = fixedCategories.reduce((sum, c) => sum + (c.target_amount || 0), 0);
    const disposableIncome = income - fixedCosts;

    const variableTransactions = transactions.filter(
        (t) => t.type === 'expense' && categories.find((c) => c.id === t.category_id)?.type === 'variable'
    );
    const variableSpent = variableTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
        total_income: income,
        fixed_costs: fixedCosts,
        disposable_income: disposableIncome,
        variable_spent: variableSpent,
        remaining: disposableIncome - variableSpent,
    };
}

// Calculate category spending progress
export function calculateCategoryProgress(
    categories: Category[],
    transactions: Transaction[],
    disposableIncome: number
): CategoryWithSpend[] {
    return categories.map((category) => {
        const categoryTransactions = transactions.filter(
            (t) => t.category_id === category.id && t.type === 'expense'
        );
        const currentSpend = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

        let target: number;
        if (category.type === 'fixed') {
            target = category.target_amount || 0;
        } else {
            target = (disposableIncome * (category.target_percentage || 0)) / 100;
        }

        const progress = target > 0 ? (currentSpend / target) * 100 : 0;

        return {
            ...category,
            current_spend: currentSpend,
            progress: Math.min(progress, 150),
        };
    });
}

import { Transaction } from '@/types/database';

interface ParsedTransaction {
    amount: number;
    category: string;
    description: string;
}

// Mock AI parser function - simulates parsing natural language into transactions
export async function parseTransaction(text: string): Promise<ParsedTransaction[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results: ParsedTransaction[] = [];

    // Simple pattern matching for demo
    // Pattern: "～に〇〇円" or "〇〇円を～"
    const patterns = [
        /(\d+)円.*?(食費|スーパー|コンビニ|買い物|groceries)/gi,
        /(\d+)円.*?(コーヒー|カフェ|coffee)/gi,
        /(\d+)円.*?(交通費|電車|バス)/gi,
        /(\d+)円.*?(趣味|ゲーム|本|映画)/gi,
        /(食費|スーパー).*?(\d+)円/gi,
        /(コーヒー|カフェ).*?(\d+)円/gi,
    ];

    // Category mapping
    const categoryMapping: Record<string, string> = {
        '食費': 'cat-5',
        'スーパー': 'cat-5',
        'コンビニ': 'cat-5',
        '買い物': 'cat-5',
        'groceries': 'cat-5',
        'コーヒー': 'cat-5',
        'カフェ': 'cat-5',
        'coffee': 'cat-5',
        '交通費': 'cat-7',
        '電車': 'cat-7',
        'バス': 'cat-7',
        '趣味': 'cat-6',
        'ゲーム': 'cat-6',
        '本': 'cat-6',
        '映画': 'cat-6',
    };

    // Simple extraction
    const amountMatch = text.match(/(\d+)円/g);
    if (amountMatch) {
        amountMatch.forEach((match) => {
            const amount = parseInt(match.replace('円', ''));
            let category = 'cat-5'; // Default to food
            let description = text.slice(0, 20);

            for (const [keyword, catId] of Object.entries(categoryMapping)) {
                if (text.toLowerCase().includes(keyword.toLowerCase())) {
                    category = catId;
                    description = keyword;
                    break;
                }
            }

            results.push({
                amount,
                category,
                description,
            });
        });
    }

    // If no results, return a default parsed result
    if (results.length === 0) {
        results.push({
            amount: 0,
            category: 'cat-5',
            description: '解析できませんでした',
        });
    }

    return results;
}

// Create transaction from parsed data
export function createTransactionFromParsed(
    parsed: ParsedTransaction,
    userId: string
): Omit<Transaction, 'id'> {
    return {
        user_id: userId,
        category_id: parsed.category,
        amount: parsed.amount,
        date: new Date().toISOString().split('T')[0],
        description: parsed.description,
        type: 'expense',
    };
}

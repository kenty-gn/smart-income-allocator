// AI解析結果の型
export interface ParsedTransaction {
    amount: number;
    category: string;
    description: string;
}

// API経由でAI解析を実行
export async function parseTransaction(
    text: string,
    categories?: string[]
): Promise<ParsedTransaction[]> {
    try {
        const response = await fetch('/api/ai/parse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                categories,
            }),
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error parsing transaction:', error);
        // エラー時は空の結果を返す
        return [];
    }
}

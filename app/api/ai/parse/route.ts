import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// カテゴリー候補リスト
const DEFAULT_CATEGORIES = [
    '食費', '外食', 'コンビニ', 'スーパー',
    '交通費', '電車', 'バス', 'タクシー',
    '娯楽', '趣味', '映画', 'ゲーム',
    '日用品', '衣服', '美容',
    '水道光熱費', '通信費', '家賃', '保険',
    'サブスクリプション', 'その他'
];

interface ParsedExpense {
    amount: number;
    category: string;
    description: string;
}

// OpenAI APIを使用した解析
async function parseWithOpenAI(text: string, categories: string[]): Promise<ParsedExpense[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `あなたは日本語の支出入力を解析するアシスタントです。
ユーザーの入力から支出情報を抽出し、JSON形式で返してください。

利用可能なカテゴリー: ${categories.join(', ')}

以下のJSON形式で返してください:
[{"amount": 金額(数値), "category": "カテゴリー名", "description": "説明"}]

例:
入力: "食費に3000円、コーヒー代500円使った"
出力: [{"amount": 3000, "category": "食費", "description": "食費"}, {"amount": 500, "category": "食費", "description": "コーヒー代"}]

注意:
- 金額は数値で返す
- カテゴリーは利用可能なカテゴリーから最も適切なものを選ぶ
- 解析できない場合は空配列[]を返す`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';

    try {
        // JSONを抽出（コードブロックで囲まれている場合も対応）
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch {
        console.error('Failed to parse OpenAI response:', content);
        return [];
    }
}

// フォールバック: ローカルパターンマッチング
function parseLocally(text: string): ParsedExpense[] {
    const results: ParsedExpense[] = [];

    // カテゴリーマッピング
    const categoryMapping: Record<string, string> = {
        '食費': '食費', 'スーパー': '食費', 'コンビニ': '食費',
        '買い物': '食費', 'ランチ': '食費', '昼食': '食費',
        'コーヒー': '食費', 'カフェ': '食費', 'お茶': '食費',
        '外食': '食費', 'ディナー': '食費', '夕食': '食費',
        '交通費': '交通費', '電車': '交通費', 'バス': '交通費',
        'タクシー': '交通費', '定期': '交通費',
        '趣味': '娯楽', 'ゲーム': '娯楽', '本': '娯楽',
        '映画': '娯楽', '動画': '娯楽',
        '日用品': '日用品', '雑貨': '日用品',
        '衣服': '衣服', '服': '衣服', 'ファッション': '衣服',
    };

    // 金額パターン
    const amountPatterns = [
        /(\d{1,3}(?:,\d{3})*|\d+)円/g,
        /¥(\d{1,3}(?:,\d{3})*|\d+)/g,
    ];

    for (const pattern of amountPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const amount = parseInt(match[1].replace(/,/g, ''));
            let category = '食費'; // デフォルト
            let description = '';

            // カテゴリーを検出
            for (const [keyword, cat] of Object.entries(categoryMapping)) {
                if (text.includes(keyword)) {
                    category = cat;
                    description = keyword;
                    break;
                }
            }

            if (!description) {
                description = `${amount}円の支出`;
            }

            results.push({ amount, category, description });
        }
    }

    return results;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, categories = DEFAULT_CATEGORIES } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: '入力テキストが必要です' },
                { status: 400 }
            );
        }

        let results: ParsedExpense[];

        // OpenAI APIキーがある場合はAI解析を使用
        if (process.env.OPENAI_API_KEY) {
            try {
                results = await parseWithOpenAI(text, categories);
                if (results.length === 0) {
                    // AIが解析できない場合はローカル解析にフォールバック
                    results = parseLocally(text);
                }
            } catch (error) {
                console.error('OpenAI API error:', error);
                results = parseLocally(text);
            }
        } else {
            // APIキーがない場合はローカル解析
            results = parseLocally(text);
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Parse error:', error);
        return NextResponse.json(
            { error: '解析中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

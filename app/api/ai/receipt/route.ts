import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ParsedReceiptItem {
    name: string;
    amount: number;
    quantity?: number;
}

interface ParsedReceipt {
    storeName: string;
    date: string;
    total: number;
    items: ParsedReceiptItem[];
}

interface ParsedExpense {
    amount: number;
    category: string;
    description: string;
}

// カテゴリーマッピング
const CATEGORY_MAPPING: Record<string, string[]> = {
    '食費': ['スーパー', 'コンビニ', '食品', '弁当', 'パン', '飲料', '野菜', '肉', '魚', 'お菓子'],
    '外食': ['レストラン', 'カフェ', 'ファミレス', '居酒屋', 'ラーメン', '寿司', '焼肉', 'マクドナルド', 'スターバックス'],
    '日用品': ['ドラッグストア', '薬局', '洗剤', 'シャンプー', 'ティッシュ', 'トイレ'],
    '交通費': ['電車', 'バス', 'タクシー', 'ガソリン', '駐車'],
    '衣服': ['ユニクロ', 'GU', 'ZARA', 'H&M', 'しまむら', '衣料'],
    '娯楽': ['映画', 'ゲーム', '本', '雑誌', 'CD', 'DVD'],
    '美容': ['美容室', '化粧品', 'コスメ'],
};

function categorizeStore(storeName: string, items: ParsedReceiptItem[]): string {
    const searchText = `${storeName} ${items.map(i => i.name).join(' ')}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    return '食費'; // デフォルト
}

async function parseReceiptWithVision(imageBase64: string, categories: string[]): Promise<ParsedExpense[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `あなたはレシート画像を解析する専門家です。
画像からレシートの情報を抽出し、以下のJSON形式で返してください。

{
  "storeName": "店舗名",
  "date": "YYYY-MM-DD形式の日付",
  "total": 合計金額（数値）,
  "items": [
    {"name": "商品名", "amount": 金額, "quantity": 個数}
  ]
}

注意:
- 合計金額は数値で返す（カンマや円記号は含めない）
- 日付が読み取れない場合は今日の日付を使用
- 商品名は簡潔に
- 解析できない場合は全てnullまたは空で返す`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'このレシート画像から情報を抽出してください。' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageBase64.startsWith('data:')
                                    ? imageBase64
                                    : `data:image/jpeg;base64,${imageBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.2,
        });

        const content = response.choices[0]?.message?.content || '{}';

        // JSONを抽出
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in response:', content);
            return [];
        }

        const parsed: ParsedReceipt = JSON.parse(jsonMatch[0]);

        if (!parsed.total || parsed.total === 0) {
            return [];
        }

        // カテゴリーを推定
        const category = categorizeStore(parsed.storeName || '', parsed.items || []);

        // 結果を返す
        const results: ParsedExpense[] = [{
            amount: parsed.total,
            category: categories.includes(category) ? category : categories[0] || '食費',
            description: parsed.storeName || 'レシート'
        }];

        return results;
    } catch (error) {
        console.error('Vision API error:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, categories = ['食費', '外食', '日用品', '交通費', '娯楽'] } = body;

        if (!image || typeof image !== 'string') {
            return NextResponse.json(
                { error: 'レシート画像が必要です' },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI APIキーが設定されていません' },
                { status: 500 }
            );
        }

        const results = await parseReceiptWithVision(image, categories);

        if (results.length === 0) {
            return NextResponse.json(
                { error: 'レシートを解析できませんでした。別の画像をお試しください。' },
                { status: 400 }
            );
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Receipt parse error:', error);
        return NextResponse.json(
            { error: 'レシートの解析中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

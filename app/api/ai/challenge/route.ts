import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface SpendingData {
    topCategories: { name: string; amount: number }[];
    totalExpense: number;
    savingsRate: number;
}

interface Challenge {
    title: string;
    description: string;
    target: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

async function generateChallengesWithAI(data: SpendingData): Promise<Challenge[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `ユーザーの支出データに基づいて、今週の節約チャレンジを3つ提案してください。

データ:
- 月間支出: ¥${data.totalExpense.toLocaleString()}
- 貯蓄率: ${data.savingsRate.toFixed(1)}%
- 支出上位カテゴリー: ${data.topCategories.map(c => `${c.name}(¥${c.amount.toLocaleString()})`).join(', ')}

チャレンジの条件:
- 達成可能で具体的な目標
- easy/medium/hard の3段階で1つずつ
- 日本語で回答

JSON形式で回答:
{
  "challenges": [
    {"title": "タイトル", "description": "説明", "target": "目標期間や金額", "difficulty": "easy"},
    ...
  ]
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.challenges || [];
        }
        return [];
    } catch {
        console.error('Failed to parse challenges:', content);
        return [];
    }
}

function generateDefaultChallenges(data: SpendingData): Challenge[] {
    const challenges: Challenge[] = [];

    // Easy challenge
    if (data.topCategories.some(c => c.name.includes('食') || c.name.includes('コンビニ'))) {
        challenges.push({
            title: 'コンビニ断ち',
            description: 'コンビニでの買い物を控えて自炊やスーパーを活用しましょう',
            target: '今週3回まで',
            difficulty: 'easy',
        });
    } else {
        challenges.push({
            title: '水筒持参チャレンジ',
            description: '毎日水筒を持参してペットボトル代を節約',
            target: '週5日達成',
            difficulty: 'easy',
        });
    }

    // Medium challenge
    challenges.push({
        title: '外食オフウィーク',
        description: '今週は外食を避けて自炊に挑戦しましょう',
        target: '週3,000円節約',
        difficulty: 'medium',
    });

    // Hard challenge
    const targetSaving = Math.round(data.totalExpense * 0.1);
    challenges.push({
        title: '10%節約チャレンジ',
        description: '意識的に支出を10%カットしてみましょう',
        target: `¥${targetSaving.toLocaleString()}節約`,
        difficulty: 'hard',
    });

    return challenges;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { data } = body as { data: SpendingData };

        if (!data) {
            return NextResponse.json(
                { error: '支出データが必要です' },
                { status: 400 }
            );
        }

        let challenges: Challenge[];

        if (process.env.OPENAI_API_KEY) {
            try {
                challenges = await generateChallengesWithAI(data);
                if (challenges.length === 0) {
                    challenges = generateDefaultChallenges(data);
                }
            } catch (error) {
                console.error('OpenAI API error:', error);
                challenges = generateDefaultChallenges(data);
            }
        } else {
            challenges = generateDefaultChallenges(data);
        }

        return NextResponse.json({ challenges });
    } catch (error) {
        console.error('Challenge generation error:', error);
        return NextResponse.json(
            { error: 'チャレンジ生成中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

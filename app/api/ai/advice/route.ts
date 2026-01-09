import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    categoryBreakdown: {
        name: string;
        amount: number;
        percentage: number;
    }[];
    topExpenseCategories: string[];
    savingsRate: number;
}

async function generateAdviceWithAI(summary: TransactionSummary): Promise<string[]> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `あなたは家計アドバイザーです。以下の支出データを分析し、具体的で実行可能なアドバイスを3つ提供してください。

データ:
- 月収: ¥${summary.totalIncome.toLocaleString()}
- 月間支出: ¥${summary.totalExpense.toLocaleString()}
- 貯蓄率: ${summary.savingsRate.toFixed(1)}%
- 支出上位カテゴリー: ${summary.topExpenseCategories.join(', ')}
- カテゴリー別内訳:
${summary.categoryBreakdown.map(c => `  - ${c.name}: ¥${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join('\n')}

要件:
- 各アドバイスは1〜2文で簡潔に
- 具体的な金額や割合を含める
- ポジティブな表現を使う
- 日本語で回答

JSON形式で回答してください: {"advice": ["アドバイス1", "アドバイス2", "アドバイス3"]}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.advice || [];
        }
        return [];
    } catch {
        console.error('Failed to parse AI advice response:', content);
        return [];
    }
}

// フォールバック: ルールベースのアドバイス
function generateRuleBasedAdvice(summary: TransactionSummary): string[] {
    const advice: string[] = [];

    // 貯蓄率に基づくアドバイス
    if (summary.savingsRate < 10) {
        advice.push(`貯蓄率が${summary.savingsRate.toFixed(1)}%と低めです。まずは毎月の支出を5%削減することを目標にしましょう。`);
    } else if (summary.savingsRate >= 20) {
        advice.push(`貯蓄率${summary.savingsRate.toFixed(1)}%は素晴らしいですね！この調子で続けましょう。`);
    } else {
        advice.push(`貯蓄率${summary.savingsRate.toFixed(1)}%は良いペースです。20%を目指してみましょう。`);
    }

    // 上位支出カテゴリーに基づくアドバイス
    if (summary.topExpenseCategories.length > 0) {
        const topCategory = summary.topExpenseCategories[0];
        const topCategoryData = summary.categoryBreakdown.find(c => c.name === topCategory);
        if (topCategoryData && topCategoryData.percentage > 30) {
            advice.push(`${topCategory}が支出の${topCategoryData.percentage.toFixed(0)}%を占めています。見直しの余地があるかもしれません。`);
        }
    }

    // 一般的なアドバイス
    if (summary.categoryBreakdown.some(c => c.name.includes('サブスク'))) {
        advice.push('サブスクリプションを定期的に見直し、使っていないものは解約しましょう。');
    } else {
        advice.push('固定費の見直しで月5,000円以上の節約が可能な場合が多いです。');
    }

    return advice.slice(0, 3);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { summary } = body as { summary: TransactionSummary };

        if (!summary) {
            return NextResponse.json(
                { error: 'サマリーデータが必要です' },
                { status: 400 }
            );
        }

        let advice: string[];

        // OpenAI APIキーがある場合はAI生成を使用
        if (process.env.OPENAI_API_KEY) {
            try {
                advice = await generateAdviceWithAI(summary);
                if (advice.length === 0) {
                    advice = generateRuleBasedAdvice(summary);
                }
            } catch (error) {
                console.error('OpenAI API error:', error);
                advice = generateRuleBasedAdvice(summary);
            }
        } else {
            advice = generateRuleBasedAdvice(summary);
        }

        return NextResponse.json({ advice });
    } catch (error) {
        console.error('Advice generation error:', error);
        return NextResponse.json(
            { error: 'アドバイス生成中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ChatContext {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    categoryBreakdown: { name: string; amount: number }[];
}

async function generateChatResponse(
    message: string,
    context: ChatContext,
    history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `あなたは家計アシスタントAIです。ユーザーの家計に関する質問に親切に答えてください。

ユーザーの現在の家計状況:
- 月収: ¥${context.totalIncome.toLocaleString()}
- 月間支出: ¥${context.totalExpense.toLocaleString()}
- 貯蓄: ¥${context.savings.toLocaleString()}
- カテゴリー別支出:
${context.categoryBreakdown.map(c => `  - ${c.name}: ¥${c.amount.toLocaleString()}`).join('\n')}

回答のルール:
- 簡潔に答える（2-3文程度）
- 具体的な数字を使う
- 励ましの言葉を添える
- 日本語で回答`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 300,
    });

    return response.choices[0]?.message?.content || '申し訳ございません、回答を生成できませんでした。';
}

// フォールバック: シンプルな回答
function generateFallbackResponse(message: string, context: ChatContext): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('いくら') && lowerMessage.includes('使')) {
        return `今月は¥${context.totalExpense.toLocaleString()}使っています。`;
    }
    if (lowerMessage.includes('貯蓄') || lowerMessage.includes('貯金')) {
        return `今月の貯蓄額は¥${context.savings.toLocaleString()}です。`;
    }
    if (lowerMessage.includes('収入')) {
        return `今月の収入は¥${context.totalIncome.toLocaleString()}です。`;
    }
    if (lowerMessage.includes('予算') || lowerMessage.includes('残り')) {
        return `今月の残り予算は¥${context.savings.toLocaleString()}です。`;
    }
    if (context.categoryBreakdown.length > 0) {
        const top = context.categoryBreakdown[0];
        return `一番支出が多いのは「${top.name}」で¥${top.amount.toLocaleString()}です。`;
    }

    return '質問の内容を理解できませんでした。「今月いくら使った？」「貯蓄はいくら？」などと聞いてみてください。';
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, context, history = [] } = body;

        if (!message || !context) {
            return NextResponse.json(
                { error: 'メッセージとコンテキストが必要です' },
                { status: 400 }
            );
        }

        let reply: string;

        if (process.env.OPENAI_API_KEY) {
            try {
                reply = await generateChatResponse(message, context, history);
            } catch (error) {
                console.error('OpenAI API error:', error);
                reply = generateFallbackResponse(message, context);
            }
        } else {
            reply = generateFallbackResponse(message, context);
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'チャット処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ランタイム時のみ初期化
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
}

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        const supabaseAdmin = getSupabaseAdmin();

        const body = await request.json();
        const { userId, userEmail, successUrl, cancelUrl } = body;

        if (!userId || !userEmail) {
            return NextResponse.json(
                { error: 'ユーザー情報が必要です' },
                { status: 400 }
            );
        }

        // 既存のStripe顧客を検索または作成
        let customerId: string;
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
        } else {
            // 新規顧客作成
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: { userId },
            });
            customerId = customer.id;

            // DBに保存
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId);
        }

        // Checkout Session作成
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${request.headers.get('origin')}/settings?success=true`,
            cancel_url: cancelUrl || `${request.headers.get('origin')}/settings?canceled=true`,
            metadata: { userId },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        return NextResponse.json(
            { error: 'チェックアウトセッションの作成に失敗しました' },
            { status: 500 }
        );
    }
}

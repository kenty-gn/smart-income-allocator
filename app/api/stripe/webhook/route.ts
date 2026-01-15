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
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (userId) {
                    // サブスクリプションをproに更新
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'pro',
                            stripe_subscription_id: session.subscription as string,
                        })
                        .eq('id', userId);

                    console.log(`User ${userId} upgraded to Pro`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // サブスクリプションIDから該当ユーザーを見つけてfreeに戻す
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_tier: 'free',
                        stripe_subscription_id: null,
                    })
                    .eq('stripe_subscription_id', subscription.id);

                console.log(`Subscription ${subscription.id} canceled`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // キャンセル予定の場合もハンドリング可能
                if (subscription.cancel_at_period_end) {
                    console.log(`Subscription ${subscription.id} will be canceled at period end`);
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

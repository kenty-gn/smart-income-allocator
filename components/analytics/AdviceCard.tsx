'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdviceCardProps {
    surplus: number;
}

export function AdviceCard({ surplus }: AdviceCardProps) {
    const isPositive = surplus >= 10000;

    if (isPositive) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 to-teal-950 p-6"
            >
                {/* Background decoration */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                            <TrendingUp className="h-6 w-6 text-slate-900" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">余剰資金を活用しましょう</h3>
                            <p className="text-sm text-emerald-400">投資で資産を増やすチャンス</p>
                        </div>
                    </div>

                    <p className="mb-4 text-sm text-slate-300">
                        今月の余剰資金¥{surplus.toLocaleString()}を投資に回すことで、
                        将来の資産形成に繋げることができます。
                    </p>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            onClick={() => alert('投資ページへ（モック）')}
                        >
                            投資を始める
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                            詳しく見る
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950 to-orange-950 p-6"
        >
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                        <Zap className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">固定費を見直しませんか？</h3>
                        <p className="text-sm text-amber-400">もっと節約できるかも</p>
                    </div>
                </div>

                <p className="mb-4 text-sm text-slate-300">
                    光熱費や通信費を見直すことで、毎月の支出を減らすことができます。
                    簡単な比較で最適なプランを見つけましょう。
                </p>

                <div className="flex gap-3">
                    <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        onClick={() => alert('公共料金比較ページへ（モック）')}
                    >
                        プランを比較
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                        詳しく見る
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

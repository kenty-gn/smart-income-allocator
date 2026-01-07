'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { parseTransaction } from '@/lib/ai-parser';

interface ParsedResult {
    amount: number;
    category: string;
    description: string;
}

interface AIInputProps {
    onTransactionAdd: (parsed: ParsedResult[]) => void;
}

export function AIInput({ onTransactionAdd }: AIInputProps) {
    const { isPro } = useAuth();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<ParsedResult[]>([]);
    const [error, setError] = useState('');

    const handleParse = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const parsed = await parseTransaction(input);
            if (parsed[0].amount === 0) {
                setError('入力を解析できませんでした。もう一度お試しください。');
            } else {
                setResults(parsed);
            }
        } catch {
            setError('エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        onTransactionAdd(results);
        setInput('');
        setResults([]);
    };

    const handleCancel = () => {
        setResults([]);
    };

    const categoryNames: Record<string, string> = {
        'cat-5': '食費',
        'cat-6': '趣味',
        'cat-7': '交通費',
    };

    return (
        <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            {/* Pro Lock Overlay */}
            <AnimatePresence>
                {!isPro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/90 backdrop-blur-sm"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                            <Lock className="h-8 w-8 text-slate-900" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-white">Pro機能</h3>
                        <p className="mb-4 text-center text-sm text-slate-400">
                            AI入力機能はProプランでご利用いただけます
                        </p>
                        <Button
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-500 hover:to-orange-600"
                            onClick={() => { }}
                        >
                            Proにアップグレード
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">AI入力</h3>
                <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-semibold text-slate-900">
                    PRO
                </span>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例: 食費に3000円、コーヒー代500円を使った"
                className="mb-4 h-24 w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {error && (
                <p className="mb-4 text-sm text-red-400">{error}</p>
            )}

            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 space-y-2"
                    >
                        <p className="text-sm text-slate-400">解析結果:</p>
                        {results.map((result, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-slate-800 p-3"
                            >
                                <div>
                                    <span className="font-medium text-white">
                                        ¥{result.amount.toLocaleString()}
                                    </span>
                                    <span className="ml-2 text-sm text-slate-400">
                                        → {categoryNames[result.category] || result.category}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500">{result.description}</span>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleConfirm}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                登録
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                <X className="mr-2 h-4 w-4" />
                                キャンセル
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {results.length === 0 && (
                <Button
                    onClick={handleParse}
                    disabled={isLoading || !input.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            解析中...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            AIで解析
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}

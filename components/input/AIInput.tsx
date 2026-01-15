'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, X, Type, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseTransaction } from '@/lib/ai-parser';
import { ReceiptScanner } from './ReceiptScanner';

interface ParsedResult {
    amount: number;
    category: string;
    description: string;
}

interface Category {
    id: string;
    name: string;
}

interface AIInputProps {
    onTransactionAdd: (parsed: ParsedResult[]) => void;
    categories?: Category[];
}

type InputMode = 'text' | 'receipt';

export function AIInput({ onTransactionAdd, categories = [] }: AIInputProps) {
    const [mode, setMode] = useState<InputMode>('text');
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
            if (parsed.length === 0 || (parsed[0] && parsed[0].amount === 0)) {
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

    const handleReceiptSubmit = (expenses: { amount: number; category_id: string; description: string }[]) => {
        // category_idからcategory名を取得
        const results = expenses.map(exp => {
            const category = categories.find(c => c.id === exp.category_id);
            return {
                amount: exp.amount,
                category: category?.name || '食費',
                description: exp.description,
            };
        });
        onTransactionAdd(results);
    };

    return (
        <div className="bento-item card-elevated p-5">
            {/* ヘッダーとタブ */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">AI入力</h3>
                </div>
            </div>

            {/* タブ切り替え */}
            <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
                <button
                    onClick={() => setMode('text')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${mode === 'text'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Type className="h-4 w-4" />
                    テキスト入力
                </button>
                <button
                    onClick={() => setMode('receipt')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${mode === 'receipt'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Camera className="h-4 w-4" />
                    レシート読み取り
                </button>
            </div>

            {/* テキスト入力モード */}
            {mode === 'text' && (
                <>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="例: 食費に3000円、コーヒー代500円を使った"
                        className="mb-4 h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    {error && (
                        <p className="mb-4 text-sm text-rose-600">{error}</p>
                    )}

                    <AnimatePresence>
                        {results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 space-y-2"
                            >
                                <p className="text-sm text-slate-500">解析結果:</p>
                                {results.map((result, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-3"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-900">
                                                ¥{result.amount.toLocaleString()}
                                            </span>
                                            <span className="ml-2 text-sm text-slate-500">
                                                → {result.category}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">{result.description}</span>
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
                                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
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
                </>
            )}

            {/* レシート読み取りモード */}
            {mode === 'receipt' && (
                <ReceiptScanner
                    categories={categories}
                    onSubmit={handleReceiptSubmit}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}


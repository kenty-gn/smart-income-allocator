'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParsedExpense {
    amount: number;
    category: string;
    description: string;
}

interface ReceiptScannerProps {
    categories: { id: string; name: string }[];
    onSubmit: (expenses: { amount: number; category_id: string; description: string }[]) => void;
    isLoading?: boolean;
}

export function ReceiptScanner({ categories, onSubmit, isLoading = false }: ReceiptScannerProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<ParsedExpense[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 画像をBase64に変換
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setImage(base64);
            setError(null);
            setResults([]);

            // 自動で解析開始
            await analyzeReceipt(base64);
        };
        reader.readAsDataURL(file);
    };

    const analyzeReceipt = async (imageData: string) => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    categories: categories.map(c => c.name),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'レシートの解析に失敗しました');
                return;
            }

            setResults(data.results || []);
        } catch (err) {
            console.error('Receipt analysis error:', err);
            setError('レシートの解析中にエラーが発生しました');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = () => {
        const expenses = results.map(result => {
            const category = categories.find(c => c.name === result.category);
            return {
                amount: result.amount,
                category_id: category?.id || categories[0]?.id || '',
                description: result.description,
            };
        });
        onSubmit(expenses);
        reset();
    };

    const reset = () => {
        setImage(null);
        setResults([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* アップロードエリア */}
            {!image && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="receipt-input"
                    />
                    <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Camera className="w-5 h-5" />
                                カメラで撮影
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                画像を選択
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            レシートを撮影または選択してください
                        </p>
                    </div>
                </motion.div>
            )}

            {/* プレビューと結果 */}
            <AnimatePresence>
                {image && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* 画像プレビュー */}
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                                src={image}
                                alt="レシート"
                                className="w-full max-h-64 object-contain"
                            />
                            <button
                                onClick={reset}
                                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 解析中 */}
                        {isAnalyzing && (
                            <div className="flex items-center justify-center gap-2 py-8 text-primary">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>レシートを解析中...</span>
                            </div>
                        )}

                        {/* エラー */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                <p>{error}</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => analyzeReceipt(image)}
                                    className="mt-2"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    再試行
                                </Button>
                            </div>
                        )}

                        {/* 解析結果 */}
                        {results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3"
                            >
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                                    解析結果
                                </h4>
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{result.description}</p>
                                            <p className="text-sm text-gray-500">{result.category}</p>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            ¥{result.amount.toLocaleString()}
                                        </p>
                                    </div>
                                ))}

                                {/* 登録ボタン */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={reset}
                                        className="flex-1"
                                    >
                                        キャンセル
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                登録する
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

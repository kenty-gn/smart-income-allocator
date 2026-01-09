'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatContext {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    categoryBreakdown: { name: string; amount: number }[];
}

interface AIChatWidgetProps {
    context: ChatContext;
    isPro: boolean;
}

export function AIChatWidget({ context, isPro }: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context,
                    history: messages.slice(-6), // 直近6メッセージのみ送信
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。' }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '通信エラーが発生しました。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        '今月いくら使った？',
        '貯蓄はいくら？',
        '一番お金を使っているのは？',
    ];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle className="h-6 w-6" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-white" />
                                <span className="font-semibold text-white">家計アシスタント</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isPro ? (
                            <>
                                {/* Messages */}
                                <div className="h-72 overflow-y-auto p-4 space-y-3">
                                    {messages.length === 0 && (
                                        <div className="text-center text-slate-500 text-sm py-4">
                                            <p className="mb-3">家計について質問してください！</p>
                                            <div className="space-y-2">
                                                {quickQuestions.map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setInput(q);
                                                        }}
                                                        className="block w-full rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200 transition-colors"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                                        ? 'bg-indigo-500 text-white rounded-br-md'
                                                        : 'bg-slate-100 text-slate-900 rounded-bl-md'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-slate-200 p-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="質問を入力..."
                                            className="flex-1 border-slate-200"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isLoading}
                                            size="icon"
                                            className="bg-indigo-500 hover:bg-indigo-600"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                                    <Lock className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="mb-2 font-semibold text-slate-900">Pro機能</h3>
                                <p className="mb-4 text-sm text-slate-500">
                                    AIチャットアシスタントはProプランでご利用いただけます
                                </p>
                                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600">
                                    <Crown className="mr-2 h-4 w-4" />
                                    Proにアップグレード
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Tag, FileText, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/database';

interface ManualInputProps {
    categories: Category[];
    onTransactionAdd: (data: {
        category_id: string;
        amount: number;
        date: string;
        description: string;
    }) => void;
}

export function ManualInput({ categories, onTransactionAdd }: ManualInputProps) {
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !amount || !date) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        onTransactionAdd({
            category_id: categoryId,
            amount: parseFloat(amount),
            date,
            description,
        });

        // Reset form
        setCategoryId('');
        setAmount('');
        setDescription('');
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
        >
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
                    <Wallet className="h-4 w-4 text-slate-300" />
                </div>
                <h3 className="font-semibold text-white">手動入力</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-400">
                        <Tag className="h-4 w-4" />
                        カテゴリー
                    </Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="border-slate-700 bg-slate-800/50 text-white">
                            <SelectValue placeholder="カテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-700 bg-slate-800">
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat.id}
                                    value={cat.id}
                                    className="text-white focus:bg-slate-700 focus:text-white"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-400">
                        <span className="text-sm">¥</span>
                        金額
                    </Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="border-slate-700 bg-slate-800/50 text-white placeholder-slate-500"
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        日付
                    </Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-slate-700 bg-slate-800/50 text-white"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-400">
                        <FileText className="h-4 w-4" />
                        メモ
                    </Label>
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="任意"
                        className="border-slate-700 bg-slate-800/50 text-white placeholder-slate-500"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={!categoryId || !amount || isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {isSubmitting ? '追加中...' : '支出を追加'}
                </Button>
            </form>
        </motion.div>
    );
}

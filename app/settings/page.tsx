'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Crown, Palette, Trash2, Plus } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { mockCategories } from '@/lib/mock-data';
import { Category, CategoryType } from '@/types/database';

export default function SettingsPage() {
    const { user, isPro, toggleSubscription } = useAuth();
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'variable' as CategoryType,
        target_amount: '',
        target_percentage: '',
        color: '#6366f1',
    });

    const handleAddCategory = () => {
        if (!newCategory.name) return;

        const category: Category = {
            id: `cat-${Date.now()}`,
            user_id: user?.id || '',
            name: newCategory.name,
            type: newCategory.type,
            target_amount: newCategory.type === 'fixed' ? parseFloat(newCategory.target_amount) || null : null,
            target_percentage: newCategory.type === 'variable' ? parseFloat(newCategory.target_percentage) || null : null,
            color: newCategory.color,
        };

        setCategories((prev) => [...prev, category]);
        setNewCategory({
            name: '',
            type: 'variable',
            target_amount: '',
            target_percentage: '',
            color: '#6366f1',
        });
        setIsAddDialogOpen(false);
    };

    const handleDeleteCategory = (id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    const colorOptions = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
        '#f59e0b', '#10b981', '#14b8a6', '#3b82f6',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
                    <SettingsIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">設定</h1>
                    <p className="text-sm text-slate-400">カテゴリーとプランを管理</p>
                </div>
            </motion.div>

            {/* Subscription Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
            >
                <div className="mb-4 flex items-center gap-3">
                    <Crown className={`h-5 w-5 ${isPro ? 'text-amber-400' : 'text-slate-500'}`} />
                    <h2 className="text-lg font-semibold text-white">サブスクリプション</h2>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">
                    <div>
                        <p className="font-medium text-white">
                            現在のプラン: {isPro ? 'Pro' : 'Free'}
                        </p>
                        <p className="text-sm text-slate-400">
                            {isPro
                                ? 'すべての機能が利用可能です'
                                : 'AI入力と高度な分析がロックされています'}
                        </p>
                    </div>
                    <Button
                        onClick={toggleSubscription}
                        className={
                            isPro
                                ? 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:from-amber-500 hover:to-orange-600'
                        }
                    >
                        {isPro ? 'Freeに戻す' : 'Proにアップグレード'}
                    </Button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                    ※ テスト用のトグルです。実際のアプリでは決済処理が入ります。
                </p>
            </motion.div>

            {/* Categories Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Palette className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-lg font-semibold text-white">カテゴリー管理</h2>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                追加
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-slate-700 bg-slate-900">
                            <DialogHeader>
                                <DialogTitle className="text-white">カテゴリーを追加</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">カテゴリー名</Label>
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) =>
                                            setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="例: 外食"
                                        className="border-slate-700 bg-slate-800/50 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400">タイプ</Label>
                                    <Select
                                        value={newCategory.type}
                                        onValueChange={(value: CategoryType) =>
                                            setNewCategory((prev) => ({ ...prev, type: value }))
                                        }
                                    >
                                        <SelectTrigger className="border-slate-700 bg-slate-800/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-700 bg-slate-800">
                                            <SelectItem value="fixed" className="text-white">固定費</SelectItem>
                                            <SelectItem value="variable" className="text-white">変動費</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newCategory.type === 'fixed' ? (
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">目標金額 (¥)</Label>
                                        <Input
                                            type="number"
                                            value={newCategory.target_amount}
                                            onChange={(e) =>
                                                setNewCategory((prev) => ({
                                                    ...prev,
                                                    target_amount: e.target.value,
                                                }))
                                            }
                                            placeholder="10000"
                                            className="border-slate-700 bg-slate-800/50 text-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">目標パーセンテージ (%)</Label>
                                        <Input
                                            type="number"
                                            value={newCategory.target_percentage}
                                            onChange={(e) =>
                                                setNewCategory((prev) => ({
                                                    ...prev,
                                                    target_percentage: e.target.value,
                                                }))
                                            }
                                            placeholder="20"
                                            className="border-slate-700 bg-slate-800/50 text-white"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-slate-400">カラー</Label>
                                    <div className="flex gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() =>
                                                    setNewCategory((prev) => ({ ...prev, color }))
                                                }
                                                className={`h-8 w-8 rounded-full transition-transform ${newCategory.color === color
                                                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                                        : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.name}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    追加する
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Fixed Categories */}
                <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-400">固定費</h3>
                    <div className="space-y-2">
                        {categories
                            .filter((c) => c.type === 'fixed')
                            .map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-white">{category.name}</span>
                                        <span className="text-sm text-slate-500">
                                            ¥{(category.target_amount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Variable Categories */}
                <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-400">変動費</h3>
                    <div className="space-y-2">
                        {categories
                            .filter((c) => c.type === 'variable')
                            .map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-white">{category.name}</span>
                                        <span className="text-sm text-slate-500">
                                            {category.target_percentage}%
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

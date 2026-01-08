'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Crown, Palette, Trash2, Plus, Loader2, Pencil, DollarSign, CalendarDays } from 'lucide-react';
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
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryType } from '@/types/database';
import { updateProfile } from '@/lib/api/profiles';

export default function SettingsPage() {
    const { user, profile, isPro: initialIsPro, refreshProfile } = useAuth();
    const { categories, isLoading, addCategory, editCategory, removeCategory } = useCategories();

    // ローカルステート
    const [isPro, setIsPro] = useState(initialIsPro);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingIncome, setIsSavingIncome] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // 収入設定
    const [targetIncome, setTargetIncome] = useState('');
    const [salaryDay, setSalaryDay] = useState('25');

    // カテゴリー追加/編集用
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'variable' as CategoryType,
        target_amount: '',
        target_percentage: '',
        color: '#6366f1',
    });

    // profileからの初期値設定
    useEffect(() => {
        if (profile) {
            setTargetIncome(profile.target_income?.toString() || '300000');
            setSalaryDay(profile.salary_day?.toString() || '25');
        }
    }, [profile]);

    const toggleSubscription = () => {
        setIsPro((prev) => !prev);
    };

    const handleSaveIncomeSettings = async () => {
        if (!user) return;

        try {
            setIsSavingIncome(true);
            await updateProfile(user.id, {
                target_income: parseFloat(targetIncome) || 0,
                salary_day: parseInt(salaryDay) || 25,
            });
            await refreshProfile();
        } catch (error) {
            console.error('Error saving income settings:', error);
        } finally {
            setIsSavingIncome(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.name) return;

        try {
            setIsAdding(true);
            await addCategory({
                name: newCategory.name,
                type: newCategory.type,
                target_amount: newCategory.type === 'fixed' ? parseFloat(newCategory.target_amount) || undefined : undefined,
                target_percentage: newCategory.type === 'variable' ? parseFloat(newCategory.target_percentage) || undefined : undefined,
                color: newCategory.color,
            });
            setNewCategory({
                name: '',
                type: 'variable',
                target_amount: '',
                target_percentage: '',
                color: '#6366f1',
            });
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Error adding category:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory) return;

        try {
            setIsEditing(true);
            await editCategory(editingCategory.id, {
                name: editingCategory.name,
                target_amount: editingCategory.type === 'fixed' ? editingCategory.target_amount : null,
                target_percentage: editingCategory.type === 'variable' ? editingCategory.target_percentage : null,
                color: editingCategory.color,
            });
            setIsEditDialogOpen(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error editing category:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory({ ...category });
        setIsEditDialogOpen(true);
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            setDeletingId(id);
            await removeCategory(id);
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const colorOptions = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
        '#f59e0b', '#10b981', '#14b8a6', '#3b82f6',
    ];

    const salaryDayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

    const fixedCategories = categories.filter((c) => c.type === 'fixed');
    const variableCategories = categories.filter((c) => c.type === 'variable');

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

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

            {/* Income Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
            >
                <div className="mb-4 flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-white">収入設定</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-400">目標月収</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={targetIncome}
                                onChange={(e) => setTargetIncome(e.target.value)}
                                placeholder="300000"
                                className="border-slate-700 bg-slate-800/50 text-white"
                            />
                            <span className="flex items-center text-slate-400">円</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <Label className="text-slate-400">給料日</Label>
                        </div>
                        <Select value={salaryDay} onValueChange={setSalaryDay}>
                            <SelectTrigger className="border-slate-700 bg-slate-800/50 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-700 bg-slate-800 max-h-48">
                                {salaryDayOptions.map((day) => (
                                    <SelectItem key={day} value={day.toString()} className="text-white">
                                        {day}日
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSaveIncomeSettings}
                        disabled={isSavingIncome}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                        {isSavingIncome ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                保存中...
                            </>
                        ) : (
                            '保存する'
                        )}
                    </Button>
                </div>
            </motion.div>

            {/* Subscription Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
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
                                    disabled={!newCategory.name || isAdding}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            追加中...
                                        </>
                                    ) : (
                                        '追加する'
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Category Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="border-slate-700 bg-slate-900">
                        <DialogHeader>
                            <DialogTitle className="text-white">カテゴリーを編集</DialogTitle>
                        </DialogHeader>
                        {editingCategory && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">カテゴリー名</Label>
                                    <Input
                                        value={editingCategory.name}
                                        onChange={(e) =>
                                            setEditingCategory((prev) => prev ? { ...prev, name: e.target.value } : null)
                                        }
                                        className="border-slate-700 bg-slate-800/50 text-white"
                                    />
                                </div>

                                {editingCategory.type === 'fixed' ? (
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">目標金額 (¥)</Label>
                                        <Input
                                            type="number"
                                            value={editingCategory.target_amount || ''}
                                            onChange={(e) =>
                                                setEditingCategory((prev) => prev ? {
                                                    ...prev,
                                                    target_amount: parseFloat(e.target.value) || null,
                                                } : null)
                                            }
                                            className="border-slate-700 bg-slate-800/50 text-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">目標パーセンテージ (%)</Label>
                                        <Input
                                            type="number"
                                            value={editingCategory.target_percentage || ''}
                                            onChange={(e) =>
                                                setEditingCategory((prev) => prev ? {
                                                    ...prev,
                                                    target_percentage: parseFloat(e.target.value) || null,
                                                } : null)
                                            }
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
                                                    setEditingCategory((prev) => prev ? { ...prev, color } : null)
                                                }
                                                className={`h-8 w-8 rounded-full transition-transform ${editingCategory.color === color
                                                    ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                                    : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleEditCategory}
                                    disabled={!editingCategory.name || isEditing}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    {isEditing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            保存中...
                                        </>
                                    ) : (
                                        '保存する'
                                    )}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Fixed Categories */}
                <div className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-400">固定費</h3>
                    <div className="space-y-2">
                        {fixedCategories.length === 0 ? (
                            <p className="text-sm text-slate-500">固定費カテゴリーがありません</p>
                        ) : (
                            fixedCategories.map((category) => (
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
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(category)}
                                            className="text-slate-500 hover:text-indigo-400"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            disabled={deletingId === category.id}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            {deletingId === category.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Variable Categories */}
                <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-400">変動費</h3>
                    <div className="space-y-2">
                        {variableCategories.length === 0 ? (
                            <p className="text-sm text-slate-500">変動費カテゴリーがありません</p>
                        ) : (
                            variableCategories.map((category) => (
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
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(category)}
                                            className="text-slate-500 hover:text-indigo-400"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            disabled={deletingId === category.id}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            {deletingId === category.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

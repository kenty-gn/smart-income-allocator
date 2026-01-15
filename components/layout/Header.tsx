'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Settings, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/analytics', label: 'アナリティクス', icon: BarChart3 },
    { href: '/settings', label: '設定', icon: Settings },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { isPro, user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-strong">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl accent-gradient-emerald shadow-lg shadow-emerald-500/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        SmartBudget
                    </span>
                    {isPro && (
                        <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm shadow-violet-500/25">
                            PRO
                        </span>
                    )}
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100/60 p-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'text-emerald-700'
                                            : 'text-slate-600 hover:text-slate-900'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 rounded-lg bg-white shadow-sm"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {user && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-lg"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">ログアウト</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}


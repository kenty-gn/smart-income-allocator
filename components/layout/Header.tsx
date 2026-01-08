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
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">SmartBudget</span>
                    {isPro && (
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-semibold text-slate-900">
                            PRO
                        </span>
                    )}
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 rounded-lg bg-slate-800"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
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
                            className="text-slate-400 hover:text-white hover:bg-slate-800/50"
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


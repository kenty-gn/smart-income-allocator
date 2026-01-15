'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'ホーム', icon: LayoutDashboard },
    { href: '/analytics', label: '分析', icon: BarChart3 },
    { href: '/settings', label: '設定', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 z-50 glass-strong rounded-2xl md:hidden">
            <div className="flex items-center justify-around py-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center gap-1 rounded-xl px-5 py-2 text-xs font-medium transition-all duration-200',
                                isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110')} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeMobileNav"
                                    className="absolute inset-0 rounded-xl bg-emerald-50/80"
                                    style={{ zIndex: -1 }}
                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

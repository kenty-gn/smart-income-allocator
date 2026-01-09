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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors',
                                isActive ? 'text-emerald-600' : 'text-slate-500'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeMobileNav"
                                    className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

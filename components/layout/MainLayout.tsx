'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <Header />
            <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}

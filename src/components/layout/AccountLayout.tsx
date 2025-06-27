'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { t } = useTranslation();
  const { customer, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();

  // Check both state and localStorage for authentication
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthReady = Boolean(isAuthenticated && hasToken);

  if (!isAuthReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-8">Login is required to access this page</p>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              {t('login')}
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  const navigationItems = [
    { key: 'profile', label: t('navigation.account') || t('profile'), href: '/account', exact: true },
    { key: 'orders', label: t('navigation.orders') || t('orders'), href: '/orders', exact: false },
    { key: 'subscriptions', label: t('navigation.subscriptions') || t('subscriptions'), href: '/account/subscriptions', exact: true },
    { key: 'courses', label: t('navigation.courses') || t('courses'), href: '/account/courses', exact: true },
    { key: 'wishlist', label: t('navigation.wishlist') || t('wishlist'), href: '/wishlist', exact: true },
  ];

  const isActiveLink = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        {/* Profile Info Card */}
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl p-8 flex flex-col items-center glass-card">
          <div className="w-20 h-20 bg-emerald-500/90 rounded-full mb-4 flex items-center justify-center shadow-lg border-4 border-emerald-500/30">
            <span className="text-2xl font-bold text-white">
              {customer?.first_name?.charAt(0)}{customer?.last_name?.charAt(0)}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white mb-1">
            {customer?.full_name}
          </h2>
          <p className="text-sm text-zinc-400 font-medium">{customer?.email}</p>
        </div>

        {/* Tabs Navigation */}
        <nav
          className={`flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar rounded-2xl bg-zinc-900/70 border border-emerald-500/20 px-2 py-2 shadow-lg ${t('dir') === 'rtl' ? 'justify-end' : 'justify-start'}`}
          style={{ direction: 'rtl' }}
        >
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`px-5 py-2 rounded-xl font-bold text-base transition-all duration-200 border-2 border-transparent shadow-sm whitespace-nowrap flex items-center justify-center ${
                isActiveLink(item.href, item.exact)
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 hover:border-emerald-500/20'
              }`}
              style={{ direction: 'rtl' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Main Content Card */}
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl p-8 glass-card">
          {children}
        </div>
      </div>
    </div>
  );
}

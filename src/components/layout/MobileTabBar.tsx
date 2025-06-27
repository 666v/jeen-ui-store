'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
  HeartIcon as HeartSolidIcon,
  UserIcon as UserSolidIcon,
  Squares2X2Icon as Squares2X2SolidIcon
} from '@heroicons/react/24/solid';
import { useCart } from '@/lib/cart';
import { useTranslation } from '@/lib/useTranslation';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { t } = useTranslation();

  // Hide the tab bar on product pages
  if (pathname.startsWith('/products/')) {
    return null;
  }

  const tabs = [
    {
      name: t('home'),
      href: '/',
      icon: HomeIcon,
      activeIcon: HomeSolidIcon,
      isActive: pathname === '/'
    },
    {
      name: t('categories'),
      href: '/categories',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2SolidIcon,
      isActive: pathname.startsWith('/categories')
    },
    {
      name: t('cart'),
      href: '/cart',
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagSolidIcon,
      isActive: pathname === '/cart',
      badge: count > 0 ? count : undefined
    },
    {
      name: t('wishlist'),
      href: '/wishlist',
      icon: HeartIcon,
      activeIcon: HeartSolidIcon,
      isActive: pathname === '/wishlist'
    },
    {
      name: t('account'),
      href: '/account',
      icon: UserIcon,
      activeIcon: UserSolidIcon,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/orders')
    }
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind floating tab bar */}
      <div className="h-24 sm:hidden" />
      
      {/* Floating Tab Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        {/* Floating container with enhanced glass effect */}
        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/20 bg-gradient-to-r from-zinc-900/70 to-zinc-900/50">
      {/* Tab content */}
          <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const IconComponent = tab.isActive ? tab.activeIcon : tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                tab.isActive
                      ? 'bg-emerald-500/10 scale-105'
                      : 'hover:bg-zinc-800/50 active:scale-95'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`h-6 w-6 transition-colors ${
                    tab.isActive
                          ? 'text-emerald-500'
                          : 'text-zinc-300'
                  }`}
                />

                {/* Badge for cart count */}
                {tab.badge && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
              </div>

              <span className={`text-xs font-medium mt-1 transition-colors ${
                tab.isActive
                      ? 'text-emerald-500'
                      : 'text-zinc-300'
              }`}>
                {tab.name}
              </span>

              {/* Active indicator */}
              {tab.isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
      </div>
    </>
  );
}

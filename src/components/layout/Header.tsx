'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon, HeartIcon, HomeIcon, ShoppingBagIcon, Squares2X2Icon, CogIcon, GlobeAltIcon, CurrencyDollarIcon, SunIcon, TagIcon, MapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchModal from '@/components/ui/SearchModal';
import { useStore } from '@/components/StoreProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/lib/useTranslation';

// Helper function to format phone numbers
const formatPhoneNumber = (phone: string, countryCode: string = ''): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it starts with country code, format accordingly
  if (countryCode && cleaned.startsWith(countryCode.replace(/\D/g, ''))) {
    const numberWithoutCode = cleaned.substring(countryCode.replace(/\D/g, '').length);
    return `+${countryCode.replace(/\D/g, '')} ${numberWithoutCode}`;
  }
  
  // Default formatting
  return cleaned;
};

export default function Header() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showAllMobileCategories, setShowAllMobileCategories] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, customer, logout } = useAuth();
  const { count, fetchCart } = useCart();
  const { initializeFromStore } = useCurrency();

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Get store data from SSR context
  const { store } = useStore();

  // Fetch cart on mount for both guest and authenticated users
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Initialize currency from store data
  useEffect(() => {
    if (store?.currency) {
      initializeFromStore(store.currency);
    }
  }, [store?.currency, initializeFromStore]);

  // Handle scroll for floating effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter announcements based on current page
  const getVisibleAnnouncements = () => {
    if (!(store as any)?.announcements) return [];
    
    return (store as any).announcements.filter((announcement: any) => {
      // If no route is specified, show on all pages
      if (!announcement.route || announcement.route === 'all') {
        return true;
      }
      
      // Check for specific route patterns
      switch (announcement.route) {
        case 'home':
          return pathname === '/';
        case 'products':
          return pathname.startsWith('/products');
        case 'categories':
          return pathname.startsWith('/categories');
        case 'category':
          return pathname.startsWith('/categories/');
        case 'product':
          return pathname.match(/^\/products\/[^\/]+$/);
        case 'cart':
          return pathname === '/cart';
        case 'account':
          return pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname === '/wishlist';
        default:
          return pathname.includes(announcement.route);
      }
    });
  };

  const visibleAnnouncements = getVisibleAnnouncements();

  return (
    <>
      {/* Store Announcements */}
      {visibleAnnouncements && visibleAnnouncements.length > 0 && (
        <div className="bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto">
            {visibleAnnouncements.map((announcement: any, index: number) => (
              <div
                key={announcement.id}
                className="px-4 py-2 text-center text-sm font-medium flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: announcement.color || undefined,
                  color: announcement.text_color
                }}
              >
                {announcement.icon && (
                  <i className={`${announcement.icon} text-lg`} />
                )}
                {announcement.href ? (
                  <a
                    href={announcement.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: announcement.text_color }}
                  >
                    {announcement.content}
                  </a>
                ) : (
                  <span>{announcement.content}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'pt-4' : 'pt-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Floating Navigation Bar */}
          <div className={`bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/20 transition-all duration-300 ${
            isScrolled ? 'py-3' : 'py-4'
          }`}>
            <div className="flex justify-between items-center px-4 sm:px-6">
          {/* Logo */}
          <div className="flex-shrink-0">
                <Link href="/" className="flex items-center gap-3 group">
              {store?.logo ? (
                <img
                  src={store.logo}
                  alt={store.name || 'Store'}
                      className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                      <span className="text-emerald-500 font-bold text-sm">
                    {(store?.name || 'Store').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex gap-6">
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/' 
                      ? 'text-emerald-500 bg-emerald-500/10' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
              {t('navigation.home')}
            </Link>
                <Link 
                  href="/products" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith('/products') 
                      ? 'text-emerald-500 bg-emerald-500/10' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
              {t('navigation.products')}
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith('/categories') 
                        ? 'text-emerald-500 bg-emerald-500/10' 
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                    }`}
              >
                <span>{t('navigation.categories')}</span>
              </button>
              {isCategoriesOpen && (
                    <div className="absolute rtl:right-0 ltr:left-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl shadow-black/20 z-50">
                      <div className="py-2 max-h-80 overflow-y-auto">
                    <Link
                      href="/categories"
                      onClick={() => setIsCategoriesOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors border-b border-zinc-800/30"
                    >
{t('common.view')} {t('navigation.categories')}
                    </Link>
                    {(store as any)?.categories?.slice(0, 10).map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                            className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      >
                            <div className="flex items-center gap-2">
                          <span>{category.icon || '📦'}</span>
                          <span>{category.name}</span>
                          {category.products_count && (
                                <span className="text-xs text-zinc-400">({category.products_count})</span>
                          )}
                        </div>
                      </Link>
                    ))}
                    {(store as any)?.categories && (store as any).categories.length > 10 && (
                      <Link
                        href="/categories"
                        onClick={() => setIsCategoriesOpen(false)}
                            className="block px-4 py-2 text-sm text-emerald-500 hover:bg-emerald-500/10 transition-colors border-t border-zinc-800/30 text-center"
                      >
{t('common.view')} {t('navigation.categories')}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
              <div className="flex items-center gap-3">
            {/* Desktop only items */}
                <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                    className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                    <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Currency Selector */}
              <CurrencySelector />
            </div>

            {/* Cart - Always visible */}
                <Link 
                  href="/cart" 
                  className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg relative transition-all duration-200"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
              {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                      {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* Desktop User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 p-2 rounded-lg transition-all duration-200"
                >
                      <UserIcon className="h-5 w-5" />
                      <span className="hidden sm:block text-sm font-medium">{customer?.first_name}</span>
                </button>
                {isUserMenuOpen && (
                      <div className="absolute rtl:left-0 ltr:right-0 mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl shadow-black/20 z-50">
                        <div className="py-2">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      >
                        {t('navigation.account')}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      >
                        {t('navigation.orders')}
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      >
                        {t('navigation.wishlist')}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                            className="block w-full  px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        {t('auth.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                    className="hidden md:flex border-zinc-800/50 text-zinc-300 hover:text-white bg-zinc-800/50 hover:bg-zinc-800/50"
                onClick={() => setIsAuthModalOpen(true)}
              >
                {t('auth.login')}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? (
                    <XMarkIcon className="h-5 w-5" />
              ) : (
                    <Bars3Icon className="h-5 w-5" />
              )}
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Enhanced Floating Sidebar */}
            <div 
              className={`fixed top-4 rtl:left-4 ltr:right-4 h-[calc(100vh-2rem)] w-80 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/30 z-50 md:hidden transform transition-all duration-300 ease-out ${
                isMenuOpen ? 'translate-x-0 opacity-100 scale-100' : 'rtl:translate-x-full ltr:-translate-x-full opacity-0 scale-95'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800/30">
                  <div className="flex items-center gap-3">
                    {store?.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name || 'Store'}
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-500 font-bold text-sm">
                          {(store?.name || 'Store').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h2 className="text-lg font-semibold text-white">{t('common.menu')}</h2>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Enhanced Content */}
                <div className="flex-1 overflow-y-auto py-6 space-y-8">
                  {/* Enhanced Tools Section - Moved to Top */}
                      <div className="space-y-4">
                    <div className="px-4">
                      <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <CogIcon className="h-4 w-4" />
                        {t('common.tools')}
                      </h3>
                    </div>
                    
                    {/* Search Tool - Full Width Button */}
                    <div className="px-4">
                      <button
                        onClick={() => {
                          setIsSearchModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all duration-200 text-left"
                      >
                        <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400" />
                        <span className="text-sm">{t('common.search')}</span>
                      </button>
                    </div>

                    {/* Language and Currency Tools - Vertical List */}
                    <div className="space-y-3 px-4">
                      {/* Language Tool */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GlobeAltIcon className="h-5 w-5 text-blue-400" />
                          <span className="text-sm text-zinc-300">{t('common.language')}</span>
                          </div>
                        <LanguageSwitcher />
                          </div>

                      {/* Currency Tool */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
                          <span className="text-sm text-zinc-300">{t('common.currency')}</span>
                        </div>
                        <CurrencySelector />
                      </div>
                    </div>
                  </div>

                  {/* User Section */}
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="px-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {t('navigation.account')}
                        </h3>
                        </div>
                        <div className="space-y-2">
                          <Link
                            href="/account"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                          >
                            <UserIcon className="h-5 w-5" />
                          <span>{t('navigation.account')}</span>
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                          <span>{t('navigation.orders')}</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                          >
                            <HeartIcon className="h-5 w-5" />
                          <span>{t('navigation.wishlist')}</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      <div className="px-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {t('common.auth')}
                        </h3>
                      </div>
                      <div className="px-4">
                        <Button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          {t('auth.login')}
                        </Button>
                      </div>
                      </div>
                    )}

                    {/* Enhanced Navigation */}
                    <div className="space-y-4">
                    <div className="px-4">
                      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapIcon className="h-4 w-4" />
                        {t('common.navigation')}
                      </h3>
                    </div>
                      <div className="space-y-2">
                        <Link
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            pathname === '/' 
                              ? 'text-emerald-500 bg-emerald-500/10' 
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          <HomeIcon className="h-5 w-5" />
                        <span>{t('navigation.home')}</span>
                        </Link>
                        <Link
                          href="/products"
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            pathname.startsWith('/products') 
                              ? 'text-emerald-500 bg-emerald-500/10' 
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          <ShoppingBagIcon className="h-5 w-5" />
                        <span>{t('navigation.products')}</span>
                        </Link>
                        <Link
                          href="/categories"
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            pathname.startsWith('/categories') 
                              ? 'text-emerald-500 bg-emerald-500/10' 
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                          }`}
                        >
                          <Squares2X2Icon className="h-5 w-5" />
                        <span>{t('navigation.categories')}</span>
                        </Link>
                      </div>
                    </div>

                    {/* Enhanced Categories */}
                    {(store as any)?.categories && (store as any).categories.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                          <TagIcon className="h-4 w-4" />
                          {t('navigation.categories')}
                        </h3>
                          {(store as any).categories.length > 3 && (
                            <button
                              onClick={() => setShowAllMobileCategories(!showAllMobileCategories)}
                              className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                            >
                              {showAllMobileCategories ? 'أقل' : 'المزيد'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(showAllMobileCategories ? (store as any).categories : (store as any).categories.slice(0, 3)).map((category: any) => (
                            <Link
                              key={category.id}
                              href={`/categories/${category.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
                            >
                              <span className="text-lg">{category.icon || '📦'}</span>
                              <span className="flex-1">{category.name}</span>
                                {category.products_count && (
                                <span className="text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full">
                                  {category.products_count}
                                </span>
                                )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Logout */}
                    {isAuthenticated && (
                      <div className="pt-4 border-t border-zinc-800/30">
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-zinc-800/30">
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-zinc-400 transition-colors"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-zinc-400" />
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24" />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            fetchCart(); // Refresh cart after login
          }}
        />
    </>
  );
}
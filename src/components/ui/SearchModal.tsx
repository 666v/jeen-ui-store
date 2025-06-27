'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => sdk.products.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleProductClick = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-opacity duration-300" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-zinc-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl transform transition-all duration-300 ease-out glass-card animate-fade-in">
          {/* Search Input */}
          <div className={`flex items-center p-6 border-b border-zinc-700/40 bg-zinc-800/60 rounded-t-3xl ${locale === 'ar' ? 'flex-row-reverse' : ''}`}> 
            <span className={`inline-flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>
              <MagnifyingGlassIcon className="h-6 w-6 text-emerald-400 " />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-zinc-900/60 border border-zinc-700 rounded-xl px-5 py-3 text-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all shadow-inner"
              style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`${locale === 'ar' ? 'mr-2' : 'ml-2'} p-2 rounded-full hover:bg-zinc-700/60`}
              aria-label={t('close')}
            >
              <XMarkIcon className="h-6 w-6 text-zinc-400 hover:text-emerald-400 transition-colors" />
            </Button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto bg-zinc-900/70">
            {searchQuery.length === 0 ? (
              <div className="p-12 text-center">
                <MagnifyingGlassIcon className="h-14 w-14 text-emerald-400 mx-auto mb-4 opacity-70" />
                <p className="text-zinc-400 text-lg font-medium">{t('search')}...</p>
              </div>
            ) : isLoading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-800/60 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-700/40 rounded w-3/4"></div>
                        <div className="h-3 bg-zinc-700/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResults && searchResults.data && searchResults.data.length > 0 ? (
              <div className="p-2 space-y-2">
                {searchResults.data.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-800/60 hover:bg-emerald-900/30 border border-zinc-700/40 transition-all shadow group"
                  >
                    <div className="w-16 h-16 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-400 text-xl font-bold bg-zinc-800/60">
                          <MagnifyingGlassIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 min-w-0 ${locale === 'ar' ? 'text-right' : 'text-left'}`}> 
                      <h4 className="font-bold text-white truncate text-lg group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-zinc-400 truncate">
                        {(product.short_description || product.description)?.replace(/<[^>]*>/g, '').substring(0, 80) + ((product.short_description || product.description)?.length > 80 ? '...' : '')}
                      </p>
                      <div className={`flex items-center mt-1 ${locale === 'ar' ? 'justify-end' : ''} gap-2`}>
                        <span className="font-semibold text-emerald-400">
                          {product.price.formatted}
                        </span>
                        {product.categories && product.categories.length > 0 && (
                          <span className="inline-block bg-emerald-700/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-medium">
                            {product.categories[0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

                {searchResults.data.length >= 8 && (
                  <div className="p-3 text-center border-t border-zinc-700/40">
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={handleProductClick}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-bold"
                    >
                      {t('viewAllProducts') || 'View All Products'} ({searchResults.data.length}+)
                    </Link>
                  </div>
                )}
              </div>
            ) : debouncedQuery.length > 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-400 text-lg font-medium">{t('noProductsFound') || 'No products found'}</p>
                <p className="text-sm text-zinc-500 mt-2">
                  {t('tryDifferentKeywords') || 'Try searching with different keywords'}
                </p>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-zinc-700/40 bg-zinc-900/80 rounded-b-3xl">
            <div className={`flex items-center justify-between text-xs text-zinc-400 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span>↑↓ {t('navigate') || 'Navigate'}</span>
                <span>⏎ {t('select') || 'Select'}</span>
                <span>Esc {t('close') || 'Close'}</span>
              </div>
              <span className="font-bold text-emerald-400">rmz.gg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

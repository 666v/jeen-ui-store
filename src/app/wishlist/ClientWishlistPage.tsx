'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';
import { useCurrency } from '@/lib/currency';
import type { Product } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

export default function WishlistPage() {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'wishlist': 'Wishlist',
        'item': 'item',
        'items': 'items',
        'clear_all': 'Clear All',
        'wishlist_empty': 'Your wishlist is empty',
        'start_adding_products': 'Start adding products to your wishlist!',
        'continue_shopping': 'Continue Shopping',
        'login_to_view_wishlist': 'Please login to view your wishlist',
        'login': 'Login',
        'item_removed_from_wishlist': 'Item removed from wishlist',
        'error': 'Error',
        'item_added_to_cart': 'Item added to cart',
        'are_you_sure_clear_wishlist': 'Are you sure you want to clear your wishlist?',
        'wishlist_cleared': 'Wishlist cleared'
      },
      ar: {
        'wishlist': 'قائمة الرغبات',
        'item': 'عنصر',
        'items': 'عناصر',
        'clear_all': 'مسح الكل',
        'wishlist_empty': 'قائمة الرغبات فارغة',
        'start_adding_products': 'ابدأ بإضافة المنتجات إلى قائمة رغباتك!',
        'continue_shopping': 'تابع التسوق',
        'login_to_view_wishlist': 'يرجى تسجيل الدخول لعرض قائمة الرغبات',
        'login': 'تسجيل الدخول',
        'item_removed_from_wishlist': 'تمت إزالة العنصر من قائمة الرغبات',
        'error': 'خطأ',
        'item_added_to_cart': 'تمت إضافة العنصر إلى السلة',
        'are_you_sure_clear_wishlist': 'هل أنت متأكد أنك تريد مسح قائمة الرغبات؟',
        'wishlist_cleared': 'تم مسح قائمة الرغبات'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };
  const { formatPrice } = useCurrency();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { items, count, isLoading, fetchWishlist, removeFromWishlist, clearWishlist, hasFetched } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      // Always fetch fresh data when authenticated
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      toast.success(t('item_removed_from_wishlist'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1, {}, null);
      toast.success(t('item_added_to_cart'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleClearWishlist = async () => {
    if (confirm(t('are_you_sure_clear_wishlist'))) {
      try {
        await clearWishlist();
        toast.success(t('wishlist_cleared'));
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('error'));
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <HeartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('wishlist')}</h1>
            <p className="text-muted-foreground mb-6">{t('login_to_view_wishlist')}</p>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t('login')}
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            fetchWishlist();
          }}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                  <div className="bg-muted aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <HeartSolidIcon className="h-8 w-8 text-emerald-400 mr-3" />
            <h1 className="text-3xl font-extrabold text-white">{t('wishlist')} ({count} {count === 1 ? t('item') : t('items')})</h1>
          </div>
          {count > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 bg-transparent border border-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>{t('clear_all')}</span>
            </Button>
          )}
        </div>
        {count === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">{t('wishlist_empty')}</h2>
            <p className="text-zinc-400 mb-6">{t('start_adding_products')}</p>
            <Link href="/products">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-bold">{t('continue_shopping')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product.id} className="bg-zinc-900/60 border-2 border-zinc-800/50 rounded-2xl shadow-xl hover:shadow-emerald-500/10 transition-all overflow-hidden">
                <div className="relative">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-zinc-800 overflow-hidden">
                      {(product.image?.full_link || product.image?.url) ? (
                        <img
                          src={product.image.full_link || product.image.url}
                          alt={product.image?.alt_text || product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          📦
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-2 right-2 bg-zinc-900/80 rounded-full p-2 text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <Link href={`/products/${product.slug}`} className="font-bold text-white text-lg truncate hover:underline">
                      {product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-lg">{formatPrice(product.price.actual)}</span>
                    {product.price.original && product.price.original !== product.price.actual && (
                      <span className="text-zinc-400 line-through text-sm">{formatPrice(product.price.original)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 font-bold flex-1"
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
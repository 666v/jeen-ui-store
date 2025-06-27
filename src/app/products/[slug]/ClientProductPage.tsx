'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productsApi, checkoutApi } from '@/lib/store-api';
import { sdk } from '@/lib/sdk';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import type { Product, Review, SubscriptionVariant } from '@/lib/types';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';

interface ClientProductPageProps {
  slug: string
  initialProduct?: Product | null
}

export default function ClientProductPage({ slug, initialProduct }: ClientProductPageProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { selectedCurrency, formatPrice } = useCurrency();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<SubscriptionVariant | null>(null);
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isQuickPurchasing, setIsQuickPurchasing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Helper function to format price with hydration check
  const formatPriceWithHydration = (price: number | string) => {
    return isHydrated ? formatPrice(price) : `ر.س${Number(price).toFixed(2)}`;
  };

  const { data: product, isLoading: productLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProduct(slug),
    enabled: !!slug && !initialProduct,
    initialData: initialProduct,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['product-reviews', slug],
    queryFn: ({ pageParam = 1 }) => sdk.reviews.getAll({ page: pageParam, per_page: 6 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.current_page < lastPage.pagination.last_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!slug,
  });

  const allReviews = useMemo(() => {
    return reviewsData?.pages.flatMap(page => page.data) || [];
  }, [reviewsData]);

  const calculatedPrice = useMemo(() => {
    if (!product) return { total: 0, formatted: 'ر.س0.00', basePrice: 0, fieldPriceAddition: 0, unitPrice: 0 };

    let basePrice = Number(product.price.actual) || 0;

    if (selectedVariant) {
      basePrice = Number(selectedVariant.price) || 0;
    }

    let fieldPriceAddition = 0;
    if (product.fields) {
      product.fields.forEach((field, index) => {
        const selectedValue = customFields[index];
        if (selectedValue && field.options && field.options[selectedValue]?.price) {
          fieldPriceAddition += Number(field.options[selectedValue].price) || 0;
        }
      });
    }

    const unitPrice = basePrice + fieldPriceAddition;
    const totalPrice = unitPrice * quantity;

    // During SSR or before hydration, use the original price format
    // After hydration, use the selected currency format
    const formattedPrice = formatPriceWithHydration(totalPrice);

    return {
      basePrice: Number(basePrice) || 0,
      fieldPriceAddition: Number(fieldPriceAddition) || 0,
      unitPrice: Number(unitPrice) || 0,
      total: Number(totalPrice) || 0,
      formatted: formattedPrice
    };
  }, [product, selectedVariant, customFields, quantity, formatPrice, isHydrated]);

  if (productLoading) {
    return (
      <div className="min-h-screen py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'لم يتم العثور على المنتج المطلوب.' : 'The requested product could not be found.'}
          </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (product.stock && !product.stock.unlimited && quantity > product.stock.available) {
      toast.error('Requested quantity not available');
      return;
    }

    if (product.stock && !product.stock.unlimited && product.stock.available === 0) {
      toast.error('Out of stock');
      return;
    }

    setIsLoading(true);
    try {
      await addItem(
        product,
        quantity,
        customFields,
        selectedVariant
      );
      toast.success('Product added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldIndex: number, value: string) => {
    setCustomFields(prev => ({ ...prev, [fieldIndex]: value }));
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Login required');
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const averageRating = allReviews.length > 0 ?
    allReviews.reduce((acc: number, review: any) => acc + (Number(review.rating) || 0), 0) / allReviews.length : 0;

  const handleQuickPurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Login required');
      return;
    }

    setIsQuickPurchasing(true);
    try {
      await addItem(product, quantity, customFields, selectedVariant);

      try {
        await checkoutApi.create();
        router.push('/checkout');
      } catch (error) {
        router.push('/cart');
        return;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsQuickPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <nav className="flex mb-10">
          <ol className="flex items-center gap-2 bg-card/60 backdrop-blur-glass rounded-full px-6 py-2 shadow-lg border border-border/40">
            <li>
              <a href="/" className="text-white hover:text-emerald-400 transition-colors font-medium">
                {locale === 'ar' ? 'الرئيسية' : 'Home'}
              </a>
            </li>
            <li className="text-white">/</li>
            <li>
              <a href="/products" className="text-white hover:text-emerald-400 transition-colors font-medium">
                {locale === 'ar' ? 'المنتجات' : 'Products'}
              </a>
            </li>
            <li className="text-white">/</li>
            <li>
              <span className="text-white font-semibold">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div className="relative animate-fade-in">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/60 backdrop-blur-glass bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 group transition-all duration-300 hover:shadow-emerald-900/40">
              {product.image?.full_link || product.image?.url || product.image?.path ? (
                <img
                  src={product.image.full_link || product.image.url || `/storage/${product.image.path}${product.image.filename}`}
                  alt={product.image.alt_text || product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border/40">
                  <svg className="w-24 h-24 text-white/50 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <span className="text-white/70 text-center px-4">
                    {locale === 'ar' ? 'لا توجد صورة متاحة' : 'No image available'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/20 to-transparent pointer-events-none" />
              {product.is_discounted && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-fade-in">
                  -{product.price.discount_percentage}% {t('off')}
                </div>
              )}
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className="absolute top-6 right-6 w-12 h-12 bg-zinc-900/70 backdrop-blur-md border border-zinc-700/40 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500/20 transition-colors z-10 animate-fade-in"
                aria-label={isInWishlist(product.id)
                  ? (locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from Wishlist')
                  : (locale === 'ar' ? 'أضف للمفضلة' : 'Add to Wishlist')}
              >
                {isInWishlist(product.id) ? (
                  <HeartSolidIcon className="w-6 h-6 text-emerald-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-white group-hover:text-emerald-500 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-8 animate-fade-in-delay">
            <div className="backdrop-blur-glass rounded-3xl shadow-2xl border border-zinc-800/60 p-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 leading-tight bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                {product.marketing_title || product.name}
              </h1>
              {product.marketing_title && product.marketing_title !== product.name && (
                <p className="text-lg text-white/80 mb-2 font-medium">{product.name}</p>
              )}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {product.sales?.badge && typeof product.sales.badge === 'object' && (
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm border border-blue-400/40 bg-blue-900/30 text-blue-300 shadow"
                    style={{ color: product.sales.badge.color }}
                  >
                    {product.sales.badge.text}
                  </span>
                )}
                {product.is_new && (
                  <span className="px-3 py-1 text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 rounded-full backdrop-blur-sm shadow">
                    🆕 {locale === 'ar' ? 'جديد' : 'New'}
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm shadow">
                    ⭐ {locale === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                )}
                {product.is_discounted && (
                  <span className="px-3 py-1 text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded-full backdrop-blur-sm shadow">
                    🔥 {product.price.discount_percentage}% {locale === 'ar' ? 'خصم' : 'Off'}
                  </span>
                )}
                {product.is_noticeable && (
                  <span className="px-3 py-1 text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full backdrop-blur-sm shadow">
                    🎯 {locale === 'ar' ? 'رائج' : 'Trending'}
                  </span>
                )}
              </div>
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-400/30 rounded-full backdrop-blur-sm shadow text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
              {allReviews && allReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="drop-shadow">
                        {star <= averageRating ? (
                          <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-white/50" />
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-white/80 font-medium">
                    {averageRating.toFixed(1)} ({allReviews.length} {locale === 'ar' ? 'مراجعة' : 'reviews'})
                  </span>
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 bg-clip-text text-transparent drop-shadow">
                    {calculatedPrice.formatted}
                  </span>
                  {product.price.discount && (
                    <span className="text-lg text-white/60 line-through bg-zinc-800/60 px-3 py-1 rounded-full ml-2">
                      {product.price.original}
                    </span>
                  )}
                </div>
                {product.price.discount && (
                  <span className="text-sm text-green-400 font-medium ml-2">
                    {locale === 'ar' ? `وفر ${product.price.discount}%` : `Save ${product.price.discount}%`}
                  </span>
                )}
                {(quantity > 1 || calculatedPrice.fieldPriceAddition > 0) && (
                  <div className="text-sm text-white/70 mt-2">
                    {quantity > 1 && (
                      <span>
                        {formatPriceWithHydration(calculatedPrice.unitPrice)} {locale === 'ar' ? 'للقطعة' : 'each'} × {quantity}
                      </span>
                    )}
                    {calculatedPrice.fieldPriceAddition > 0 && (
                      <span className="block">
                        + {formatPriceWithHydration(calculatedPrice.fieldPriceAddition)} {locale === 'ar' ? 'للخيارات' : 'for options'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300 border border-blue-400/30 mb-4 shadow">
              {product.type.charAt(0).toUpperCase() + product.type.slice(1)} {locale === 'ar' ? 'منتج' : 'Product'}
            </div>
              <div className="space-y-6">
            {product.subscription_variants && product.subscription_variants.length > 0 && (
                  <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/40 backdrop-blur-sm animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-3">
                  {locale === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
                </h3>
                <div className="space-y-2">
                  {product.subscription_variants.map((variant) => (
                    <label
                      key={variant.id}
                          className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="subscription"
                        value={variant.id}
                        checked={selectedVariant?.id === variant.id}
                        onChange={() => setSelectedVariant(variant)}
                            className="h-4 w-4 text-blue-600 accent-emerald-500"
                      />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="font-medium text-white">
                            {variant.duration} {locale === 'ar' ? 'يوم' : 'days'}
                          </span>
                            <span className="text-lg font-bold text-emerald-400">{variant.formatted_price}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {product.fields && product.fields.length > 0 && (
                  <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/40 backdrop-blur-sm animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-3">
                  {locale === 'ar' ? 'خيارات المنتج' : 'Product Options'}
                </h3>
                <div className="space-y-4">
                  {product.fields.map((field, index) => (
                    <div key={index}>
                          <label className="block text-sm font-medium text-white mb-1">
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' && field.options ? (
                        <select
                              className="w-full border border-border rounded-md px-3 py-2 bg-background/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 backdrop-blur-sm"
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        >
                          <option value="">
                            {locale === 'ar' ? 'اختر خياراً' : 'Select an option'}
                          </option>
                          {Object.entries(field.options).map(([key, option]: [string, any]) => (
                            <option key={key} value={key}>
                                  {option.name} {option.price && `(+${formatPriceWithHydration(option.price)})`}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                              className="w-full border border-border rounded-md px-3 py-2 bg-background/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 backdrop-blur-sm"
                          rows={3}
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                              className="w-full border border-border rounded-md px-3 py-2 bg-background/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 backdrop-blur-sm"
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
                <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/40 backdrop-blur-sm animate-fade-in hidden">
                  <label className="block text-sm font-medium text-white mb-2">
                {locale === 'ar' ? 'الكمية' : 'Quantity'}
              </label>
                  <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                      className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-background/80 backdrop-blur-sm"
                >
                      <MinusIcon className="h-4 w-4 text-white" />
                </button>
                    <span className="px-4 py-2 border border-border rounded-md text-center min-w-[40px] bg-background/80 text-white backdrop-blur-sm text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const maxQuantity = product.stock?.unlimited ? quantity + 1 : Math.min(quantity + 1, product.stock?.available || 1);
                    setQuantity(maxQuantity);
                  }}
                  disabled={product.stock && !product.stock.unlimited && quantity >= product.stock.available}
                      className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-background/80 backdrop-blur-sm"
                >
                      <PlusIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
                {/* Actions */}
<div
  className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-delay"
  dir={locale === 'ar' ? 'rtl' : 'ltr'}
>
  <Button
    onClick={handleAddToCart}
    disabled={
      isLoading ||
      (product.stock && !product.stock.unlimited && product.stock.available === 0)
    }
    variant="outline"
    size="lg"
    className="h-16 w-full rounded-xl border-2 font-bold text-lg bg-emerald-500/10 hover:bg-emerald-500/20 shadow-lg hover:shadow-emerald-500/30 transition-all text-white"
  >
    {isLoading
      ? locale === 'ar' ? 'جاري التحميل...' : 'Loading...'
      : locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
  </Button>

  <Button
    onClick={handleQuickPurchase}
    disabled={
      isQuickPurchasing ||
      (product.stock && !product.stock.unlimited && product.stock.available === 0) ||
      !isAuthenticated
    }
    className="h-16 w-full bg-primary hover:bg-primary/90 rounded-xl shadow-lg font-bold text-lg transition-all text-white"
    size="lg"
  >
    {isQuickPurchasing
      ? locale === 'ar' ? 'جاري التحميل...' : 'Loading...'
      : locale === 'ar' ? 'اشتر الآن' : 'Buy Now'}
  </Button>
</div>

                <div className="grid grid-cols-2 gap-3 animate-fade-in-delay">
                <Button
                  variant="outline"
                  size="sm"
                    className="h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 flex items-center justify-center shadow hover:bg-emerald-500/10 transition-all text-white"
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                >
                  {isInWishlist(product.id) ? (
                      <HeartSolidIcon className="h-5 w-5 mr-2 text-red-500" />
                  ) : (
                      <HeartIcon className="h-5 w-5 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isWishlistLoading ?
                      (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                      isInWishlist(product.id) ?
                        (locale === 'ar' ? 'في المفضلة' : 'In Wishlist') :
                        (locale === 'ar' ? 'أضف للمفضلة' : 'Add to Wishlist')
                    }
                  </span>
                  <span className="sm:hidden">
                    {isInWishlist(product.id) ?
                      (locale === 'ar' ? 'في المفضلة' : 'In Wishlist') :
                      (locale === 'ar' ? 'المفضلة' : 'Wishlist')
                    }
                  </span>
                </Button>
                  <Button variant="outline" size="sm" className="h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 flex items-center justify-center shadow hover:bg-blue-500/10 transition-all text-white">
                    <ShareIcon className="h-5 w-5 mr-2" />
                  {locale === 'ar' ? 'مشاركة' : 'Share'}
                </Button>
              </div>
            {(quantity > 1 || calculatedPrice.fieldPriceAddition > 0 || selectedVariant) && (
                  <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-xl p-4 mt-2 backdrop-blur-sm animate-fade-in">
                    <h3 className="font-medium text-white mb-2">
                  {locale === 'ar' ? 'إجمالي السعر' : 'Total Price'}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                        <span className="text-white/80">{locale === 'ar' ? 'السعر الأساسي:' : 'Base Price:'}</span>
                        <span className="text-white">{formatPriceWithHydration(calculatedPrice.basePrice)}</span>
                  </div>
                  {calculatedPrice.fieldPriceAddition > 0 && (
                    <div className="flex justify-between">
                          <span className="text-white/80">{locale === 'ar' ? 'الخيارات:' : 'Options:'}</span>
                          <span className="text-white">+{formatPriceWithHydration(calculatedPrice.fieldPriceAddition)}</span>
                    </div>
                  )}
                  {quantity > 1 && (
                    <div className="flex justify-between">
                          <span className="text-white/80">{locale === 'ar' ? 'الكمية:' : 'Quantity:'}</span>
                          <span className="text-white">× {quantity}</span>
                    </div>
                  )}
                  <hr className="border-border/30" />
                  <div className="flex justify-between font-semibold text-lg">
                        <span className="text-white">{locale === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                        <span className="text-white">{calculatedPrice.formatted}</span>
                  </div>
                </div>
              </div>
            )}
            {product.stock && (
                  <div className="text-sm mt-2 animate-fade-in hidden">
                {product.stock.unlimited ? (
                      <span className="text-green-400 font-semibold bg-green-900/30 px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    ✓ {locale === 'ar' ? 'متوفر في المخزن' : 'In Stock'}
                  </span>
                ) : product.stock.available > 0 ? (
                      <span className="text-green-400 font-semibold bg-green-900/30 px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    ✓ {product.stock.available} {locale === 'ar' ? 'متوفر' : 'available'}
                  </span>
                ) : (
                      <span className="text-red-400 font-semibold bg-red-900/30 px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    ✗ {locale === 'ar' ? 'نفد من المخزن' : 'Out of Stock'}
                  </span>
                )}
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            <div className="backdrop-blur-glass rounded-2xl shadow-xl border border-zinc-800/50 p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-emerald-500/30 pb-2 inline-block">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h2>
              {product.description ? (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-lg text-white"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-white/80">
                  {locale === 'ar' ? 'لا يوجد وصف متاح' : 'No description available'}
                </p>
              )}
            </div>
            <div className="backdrop-blur-glass rounded-2xl shadow-xl border border-zinc-800/50 p-8 animate-fade-in-delay">
              <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-emerald-500/30 pb-2 inline-block">
                {locale === 'ar' ? 'المراجعات' : 'Reviews'} {allReviews.length > 0 && `(${allReviews.length})`}
              </h2>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border-b pb-4">
                      <div className="h-4 bg-muted/50 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : allReviews.length > 0 ? (
                <div className="space-y-8">
                  {allReviews.map((review: any) => (
                    <div key={review.id} className="bg-zinc-900/60 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/40 shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <span className="text-emerald-400 font-semibold text-sm">
                              {review.reviewer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg">{review.reviewer.name}</h4>
                            <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className="drop-shadow">
                              {star <= review.rating ? (
                                <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                              ) : (
                                      <StarIcon className="h-4 w-4 text-white/30" />
                              )}
                            </span>
                          ))}
                              </div>
                              <span className="text-sm text-white/60 font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-white/50 bg-zinc-800/50 px-3 py-1 rounded-full">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                        <p className="text-white text-base leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center py-4">
                    {isFetchingNextPage && (
                      <div className="space-y-4 w-full">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse border-b pb-4">
                            <div className="h-4 bg-muted/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isFetchingNextPage && hasNextPage && (
                      <Button
                        onClick={() => fetchNextPage()}
                        variant="outline"
                        className="w-full max-w-xs rounded-xl bg-background/80 backdrop-blur-sm border-2 shadow hover:bg-emerald-500/10 transition-all text-white"
                      >
                        {locale === 'ar' ? 'تحميل المزيد من المراجعات' : 'Load More Reviews'}
                      </Button>
                    )}
                    {!hasNextPage && allReviews.length > 0 && (
                      <div className="text-center text-white/70 text-sm">
                        {locale === 'ar' ? 'تم تحميل جميع المراجعات' : 'All reviews loaded'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-white/80">
                  {locale === 'ar' ? 'لا توجد مراجعات حتى الآن' : 'No reviews yet'}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-16 animate-fade-in-delay">
            <div className="backdrop-blur-glass rounded-2xl shadow-xl border border-zinc-800/50 p-8">
              <h3 className="text-lg font-bold text-white mb-4 border-b-2 border-emerald-500/30 pb-2 inline-block">
                {locale === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-white/70">
                    {locale === 'ar' ? 'رقم المنتج' : 'SKU'}
                  </dt>
                  <dd className="text-sm font-medium text-white">#{product.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-white/70">
                    {locale === 'ar' ? 'النوع' : 'Type'}
                  </dt>
                  <dd className="text-sm font-medium text-white capitalize">{product.type}</dd>
                </div>
                {(product.sales?.sold_count ?? 0) > 0 && (
                  <div>
                    <dt className="text-sm text-white/70">
                      {locale === 'ar' ? 'المبيعات' : 'Sales'}
                    </dt>
                    <dd className="text-sm font-medium text-white">
                      {product.sales?.sold_count} {locale === 'ar' ? 'تم بيعها' : 'sold'}
                    </dd>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <dt className="text-sm text-white/70">
                      {locale === 'ar' ? 'العلامات' : 'Tags'}
                    </dt>
                    <dd className="text-sm font-medium text-white">{product.tags.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Card for All Screens */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pb-4 lg:hidden">
        <div className="max-w-md lg:max-w-2xl mx-auto">
          <div className="backdrop-blur-glass rounded-2xl shadow-2xl border border-zinc-800/60 p-4 lg:p-6 animate-fade-in">
            {/* Price and Quantity Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                  {calculatedPrice.formatted}
                </span>
                {product.price.discount && (
                  <span className="text-sm lg:text-base text-white/60 line-through bg-zinc-800/60 px-2 py-1 rounded-full">
                    {product.price.original}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 lg:w-10 lg:h-10 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <MinusIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                </button>
                <span className="px-3 py-1 lg:px-4 lg:py-2 border border-border rounded-md text-center min-w-[40px] lg:min-w-[60px] bg-background/80 text-white backdrop-blur-sm text-sm lg:text-base font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const maxQuantity = product.stock?.unlimited ? quantity + 1 : Math.min(quantity + 1, product.stock?.available || 1);
                    setQuantity(maxQuantity);
                  }}
                  disabled={product.stock && !product.stock.unlimited && quantity >= product.stock.available}
                  className="w-8 h-8 lg:w-10 lg:h-10 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <PlusIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || (product.stock && !product.stock.unlimited && product.stock.available === 0)}
                variant="outline"
                size="lg"
                className="h-12 lg:h-14 rounded-xl border-2 font-bold text-sm lg:text-lg bg-emerald-500/10 hover:bg-emerald-500/20 shadow-lg hover:shadow-emerald-500/30 transition-all text-white"
              >
                {isLoading ?
                  (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                  (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart')
                }
              </Button>
              <Button
                onClick={handleQuickPurchase}
                disabled={isQuickPurchasing || (product.stock && !product.stock.unlimited && product.stock.available === 0) || !isAuthenticated}
                className="bg-primary hover:bg-primary/90 h-12 lg:h-14 rounded-xl shadow-lg font-bold text-sm lg:text-lg transition-all text-white"
                size="lg"
              >
                {isQuickPurchasing ?
                  (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                  (locale === 'ar' ? 'اشتر الآن' : 'Buy Now')
                }
              </Button>
            </div>

            {/* Stock Status */}
            {product.stock && (
              <div className="mt-3 text-center">
                {product.stock.unlimited ? (
                  <span className="text-green-400 font-medium text-sm lg:text-base bg-green-900/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    ✓ {locale === 'ar' ? 'متوفر في المخزن' : 'In Stock'}
                  </span>
                ) : product.stock.available > 0 ? (
                  <span className="text-green-400 font-medium text-sm lg:text-base bg-green-900/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    ✓ {product.stock.available} {locale === 'ar' ? 'متوفر' : 'available'}
                  </span>
                ) : (
                  <span className="text-red-400 font-medium text-sm lg:text-base bg-red-900/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    ✗ {locale === 'ar' ? 'نفد من المخزن' : 'Out of Stock'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

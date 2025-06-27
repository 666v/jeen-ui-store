'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { useAddToCart } from '@/hooks/useAddToCart';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: {
    original: string;
    actual: string;
    discount?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
  image?: {
    id: number;
    url?: string;
    full_link?: string;
    path: string;
    filename: string;
    alt_text?: string;
  };
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
  sales?: {
    badge?: {
      text: string;
      color?: string;
    };
  };
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  className = ""
}: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart, isAddingToCart } = useAddToCart();
  const { formatPrice } = useCurrency();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Helper function to format price with hydration check
  const formatPriceWithHydration = (price: number | string) => {
    return isHydrated ? formatPrice(price) : `ر.س${Number(price).toFixed(2)}`;
  };

  const hasDiscount = product.is_discounted || product.price.discount_percentage > 0;
  const actualPrice = parseFloat(product.price.actual);
  const originalPrice = parseFloat(product.price.original);
  const formattedActualPrice = formatPriceWithHydration(actualPrice);
  const formattedOriginalPrice = hasDiscount ? formatPriceWithHydration(originalPrice) : null;

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div
      className={`relative bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800/70 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-emerald-900/40 ${className}`}
      dir="auto"
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="relative w-full h-48 sm:h-56 bg-zinc-800">
          {product.image?.full_link ? (
            <Image
              src={product.image.full_link}
              alt={product.image.alt_text || product.name}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <svg className="w-16 h-16 text-zinc-600/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            </div>
          )}
          {/* Dynamic Badge */}
          {product.sales?.badge?.text && (
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
              <span
                className="text-white text-xs font-bold px-3 py-1 rounded-md shadow"
                style={product.sales.badge.color ? { backgroundColor: product.sales.badge.color } : { backgroundColor: '#444' }}
              >
                {product.sales.badge.text}
              </span>
            </div>
          )}
          {/* Rating Badge */}
          {product.rating && (
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1 bg-zinc-800 text-yellow-400 text-xs font-bold px-2 py-1 rounded-md shadow">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col p-4">
        {/* Category */}
        <div className="mb-1">
          <span className="text-emerald-400 text-xs font-bold">{t('category') || 'تصنيف'}</span>
        </div>
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white mb-1 truncate text-base leading-tight hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        {/* Description (placeholder, as not all products have it) */}
        <div className="text-zinc-400 text-xs mb-2 truncate">
          {product.image?.alt_text || t('productDescription') || 'وصف المنتج'}
          </div>
        {/* Price */}
        <div className="flex items-end gap-2 mb-3">
          <span className="text-lg font-extrabold text-emerald-400">
            {formattedActualPrice}
            <span className="text-sm font-normal text-white/80 ml-1">{product.price.currency}</span>
          </span>
          {hasDiscount && formattedOriginalPrice && (
            <span className="text-sm text-zinc-400 line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Wishlist Button */}
          {showWishlist && (
            <button className="w-11 h-11 flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-emerald-400 hover:border-emerald-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        {/* Add to Cart Button */}
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart(product.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-base"
            size="sm"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 11-4 0m4 0a2 2 0 114 0" />
                </svg>
              {isAddingToCart(product.id) ? t('adding') : t('addToCart')}
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}

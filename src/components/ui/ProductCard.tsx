'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { useAddToCart } from '@/hooks/useAddToCart';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  EyeIcon,
  SparklesIcon,
  BoltIcon,
  BookOpenIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
  type?: string;
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
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Get product type icon
  const getProductTypeIcon = () => {
    switch (product.type) {
      case 'digital':
        return <BoltIcon className="w-4 h-4" />;
      case 'course':
        return <BookOpenIcon className="w-4 h-4" />;
      case 'subscription':
        return <CreditCardIcon className="w-4 h-4" />;
      default:
        return <SparklesIcon className="w-4 h-4" />;
    }
  };

  // Compact variant for list view
  if (variant === 'compact') {
    return (
      <motion.div
        className={`relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-emerald-900/20 hover:border-emerald-500/30 group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        dir="auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex">
          {/* Product Image */}
          <Link href={`/products/${product.slug}`} className="block relative flex-shrink-0">
            <div className="relative w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-700 overflow-hidden">
              {product.image?.full_link ? (
                <Image
                  src={product.image.full_link}
                  alt={product.image.alt_text || product.name}
                  fill
                  className="object-cover w-full h-full transition-transform duration-300"
                  sizes="128px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
                  <svg className="w-8 h-8 text-zinc-600/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Dynamic Badge */}
              {product.sales?.badge?.text && (
                <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                  <span
                    className="text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg backdrop-blur-sm"
                    style={product.sales.badge.color ? { backgroundColor: product.sales.badge.color } : { backgroundColor: '#ef4444' }}
                  >
                    {product.sales.badge.text}
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex-1">
              {/* Product Type Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {getProductTypeIcon()}
                  {product.type === 'digital' ? t('products.digital') : 
                   product.type === 'course' ? t('products.courses') : 
                   product.type === 'subscription' ? t('products.subscriptions') : 
                   t('products.category')}
                </span>
              </div>
              
              {/* Product Name */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-bold text-white mb-2 text-lg leading-tight hover:text-emerald-400 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-zinc-800/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-zinc-300 font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                  {product.reviews_count && (
                    <span className="text-xs text-zinc-400">({product.reviews_count})</span>
                  )}
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              {/* Price */}
              <div className="flex items-end gap-2">
                <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
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
              <div className="flex items-center gap-3">
                {/* Wishlist Button */}
                {showWishlist && (
                  <button 
                    onClick={handleWishlistToggle}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/60 text-zinc-300 hover:text-emerald-400 hover:border-emerald-400 transition-all duration-300"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
                
                {/* Add to Cart Button */}
                {showAddToCart && (
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart(product.id)}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 text-sm h-11"
                    size="sm"
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                    {isAddingToCart(product.id) ? t('products.adding') : t('products.addToCart')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default grid variant
  return (
    <motion.div
      className={`relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-lg overflow-hidden flex flex-col transition-all duration-500 hover:shadow-emerald-900/20 hover:border-emerald-500/30 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      dir="auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-zinc-800 to-zinc-700">
          {product.image?.full_link ? (
            <Image
              src={product.image.full_link}
              alt={product.image.alt_text || product.name}
              fill
              className="object-cover w-full h-full transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
              <svg className="w-16 h-16 text-zinc-600/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
              <EyeIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-2">
            {/* Dynamic Badge */}
            {product.sales?.badge?.text && (
              <span
                className="text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg backdrop-blur-sm"
                style={product.sales.badge.color ? { backgroundColor: product.sales.badge.color } : { backgroundColor: '#ef4444' }}
              >
                {product.sales.badge.text}
              </span>
            )}
            
            {/* Discount Badge */}
            {hasDiscount && (
              <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg">
                -{product.price.discount_percentage}%
              </span>
            )}
          </div>

          {/* Bottom Badges */}
          <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-2">
            {/* Rating Badge */}
            {product.rating && (
              <div className="flex items-center gap-1 bg-zinc-800/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                <StarIcon className="w-4 h-4 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col p-6">
        {/* Product Type Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wide bg-emerald-500/10 px-3 py-1 rounded-lg">
            {getProductTypeIcon()}
            {product.type === 'digital' ? t('products.digital') : 
             product.type === 'course' ? t('products.courses') : 
             product.type === 'subscription' ? t('products.subscriptions') : 
             t('products.category')}
          </span>
        </div>
        
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white mb-3 text-lg leading-tight hover:text-emerald-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Description */}
        <div className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.image?.alt_text || t('products.description')}
        </div>
        
        {/* Price Section */}
        <div className="flex items-end gap-3 mb-6">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
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
        <div className="flex items-center gap-3 mt-auto">
          {/* Wishlist Button */}
          {showWishlist && (
            <button 
              onClick={handleWishlistToggle}
              className="w-12 h-12 flex items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-800/60 text-zinc-300 hover:text-emerald-400 hover:border-emerald-400 transition-all duration-300"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="w-6 h-6 text-emerald-400" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
            </button>
          )}
          
          {/* Add to Cart Button */}
          {showAddToCart && (
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart(product.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 text-base h-12"
              size="sm"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {isAddingToCart(product.id) ? t('products.adding') : t('products.addToCart')}
            </Button>
          )}
        </div>
      </div>

      {/* Hover Effect Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
}

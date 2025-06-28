'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, FunnelIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/lib/useTranslation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function ClientProductsPage() {
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  const queryParams = useMemo(() => ({
    per_page: 12,
    search: debouncedSearchTerm || undefined,
    sort: sortBy || undefined,
    type: selectedType || undefined,
    price_min: priceRange.min ? Number(priceRange.min) : undefined,
    price_max: priceRange.max ? Number(priceRange.max) : undefined,
    in_stock: inStockOnly || undefined,
  }), [debouncedSearchTerm, sortBy, selectedType, priceRange.min, priceRange.max, inStockOnly]);

  const {
    data: productsData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(queryParams);

  // Auto-load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into single array and deduplicate by ID
  const allProducts = useMemo(() => {
    const products = productsData?.pages.flatMap(page => page.data) || [];
    // Remove duplicates by keeping only the first occurrence of each product ID
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [productsData]);

  const breadcrumbItems = [
    { name: t('products.title'), href: '/products', current: true }
  ];

  // Quick filter chips
  const quickFilters = [
    { label: t('products.all'), value: '', count: allProducts.length },
    { label: t('products.digital'), value: 'digital', count: allProducts.filter(p => p.type === 'digital').length },
    { label: t('products.courses'), value: 'course', count: allProducts.filter(p => p.type === 'course').length },
    { label: t('products.subscriptions'), value: 'subscription', count: allProducts.filter(p => p.type === 'subscription').length },
  ];

  const activeFiltersCount = [
    selectedType,
    priceRange.min,
    priceRange.max,
    inStockOnly
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen from-zinc-900 via-zinc-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent mb-6">
              {t('products.title')}
            </h1>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              {t('products.browseProducts')} - {t('products.discoverAmazing')}
            </p>
          </div>

          {/* Search and Controls */}
          <div className="max-w-4xl mx-auto">
            {/* Enhanced Search Bar */}
            <div className="relative mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t('products.searchProducts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white placeholder-zinc-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedType === filter.value
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 hover:text-white border border-zinc-700/50'
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              {/* Results Count */}
              <div className="text-zinc-400">
                {isLoading ? (
                  <div className="h-4 w-32 bg-zinc-800/60 rounded animate-pulse" />
                ) : (
                  <span>
                    {t('products.showing')} <span className="text-white font-semibold">{allProducts.length}</span> {t('products.results')}
                  </span>
                )}
              </div>

              {/* Filter Button */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/60 hover:text-white hover:border-emerald-500"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {t('common.filter')}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-emerald-500 text-white text-xs rounded-full px-2 py-1">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-800/30 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-zinc-700/50"></div>
                <div className="p-6">
                  <div className="h-4 bg-zinc-700/50 rounded mb-3"></div>
                  <div className="h-4 bg-zinc-700/50 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-zinc-700/50 rounded w-1/4"></div>
                    <div className="h-10 bg-zinc-700/50 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800/60 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('products.noProductsFound')}
            </h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              {t('products.tryAdjustingFilters')}
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSortBy('created_desc');
                setPriceRange({ min: '', max: '' });
                setInStockOnly(false);
              }}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {t('products.clearFilters')}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  variant="default"
                />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="mt-12 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center space-x-3 bg-zinc-800/30 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-8 py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                  <span className="text-zinc-300">
                    {t('products.loadingMore')}
                  </span>
                </div>
              )}
              {!hasNextPage && allProducts.length > 0 && (
                <div className="flex items-center space-x-2 bg-zinc-800/30 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-6 py-4">
                  <span className="text-zinc-400">
                    {t('products.showingAll', { count: allProducts.length })}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Desktop Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative bg-zinc-900/95 backdrop-blur-lg border border-zinc-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
              <h3 className="text-xl font-semibold text-white">
                {t('common.filter')}
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/60"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Product Type & Sort By */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {t('products.type')}
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white"
                    >
                      <option value="">{t('products.allTypes')}</option>
                      <option value="digital">{t('products.digital')}</option>
                      <option value="subscription">{t('products.subscriptions')}</option>
                      <option value="course">{t('products.courses')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {t('products.sortBy')}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white"
                    >
                      <option value="created_desc">{t('products.newestFirst')}</option>
                      <option value="created_asc">{t('products.oldestFirst')}</option>
                      <option value="name_asc">{t('products.nameAZ')}</option>
                      <option value="name_desc">{t('products.nameZA')}</option>
                      <option value="price_asc">{t('products.priceLowToHigh')}</option>
                      <option value="price_desc">{t('products.priceHighToLow')}</option>
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    {t('products.priceRange')}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder={t('products.minimum')}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white placeholder-zinc-400"
                    />
                    <input
                      type="number"
                      placeholder={t('products.maximum')}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white placeholder-zinc-400"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 bg-zinc-800"
                    />
                    <span className="text-sm font-medium text-white">
                      {t('products.inStockOnly')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-700/50 bg-zinc-800/30">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <Button
                  onClick={() => {
                    setSelectedType('');
                    setSortBy('created_desc');
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                  }}
                  variant="outline"
                  className="sm:w-auto border-zinc-600 text-zinc-300 hover:bg-zinc-700/60"
                >
                  {t('products.clearAllFilters')}
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="sm:w-auto px-8 bg-emerald-500 hover:bg-emerald-600"
                >
                  {t('products.applyFilters')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-700/50 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col max-h-[85vh] min-h-[50vh]">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-zinc-600 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/50">
                <h3 className="text-xl font-semibold text-white">
                  {t('common.filter')}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/60"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {t('products.type')}
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white text-base"
                    >
                      <option value="">{t('products.allTypes')}</option>
                      <option value="digital">{t('products.digital')}</option>
                      <option value="subscription">{t('products.subscriptions')}</option>
                      <option value="course">{t('products.courses')}</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {t('products.sortBy')}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white text-base"
                    >
                      <option value="created_desc">{t('products.newestFirst')}</option>
                      <option value="created_asc">{t('products.oldestFirst')}</option>
                      <option value="name_asc">{t('products.nameAZ')}</option>
                      <option value="name_desc">{t('products.nameZA')}</option>
                      <option value="price_asc">{t('products.priceLowToHigh')}</option>
                      <option value="price_desc">{t('products.priceHighToLow')}</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {t('products.priceRange')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder={t('products.minimum')}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white text-base placeholder-zinc-400"
                      />
                      <input
                        type="number"
                        placeholder={t('products.maximum')}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white text-base placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 bg-zinc-800"
                      />
                      <span className="text-base font-medium text-white">
                        {t('products.inStockOnly')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-700/50 bg-zinc-800/30">
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSelectedType('');
                      setSortBy('created_desc');
                      setPriceRange({ min: '', max: '' });
                      setInStockOnly(false);
                    }}
                    variant="outline"
                    className="w-full py-3 text-base border-zinc-600 text-zinc-300 hover:bg-zinc-700/60"
                    size="lg"
                  >
                    {t('products.clearAllFilters')}
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 text-base bg-emerald-500 hover:bg-emerald-600"
                    size="lg"
                  >
                    {t('products.applyFilters')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/useTranslation';
import { sdk } from '@/lib/sdk';
import BannerComponent from './BannerComponent';
import ReviewsComponent from './ReviewsComponent';
import ProductListComponent from './ProductListComponent';
import FeaturesComponent from './FeaturesComponent';
import Link from 'next/link';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import HeroSection from './HeroSection';
import { FaWhatsapp, FaFacebookF, FaTiktok, FaSnapchatGhost } from 'react-icons/fa';

interface Component {
  id: number;
  type: string;
  name: string;
  data: any;
  sort_order: number;
  settings: any;
}

export default function DynamicHomepage() {
  const { t } = useTranslation();

  const { data: components = [], isLoading, error } = useQuery<Component[]>({
    queryKey: ['components'],
    queryFn: async () => {
      const result = await sdk.components.getAll();
      return result || [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeroSection />
        {/* Loading skeleton */}
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="h-8 bg-muted/50 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-muted/50 rounded-2xl h-64"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HeroSection />
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {t('errorLoadingComponents')}
          </h3>
          <p className="text-white/70">
            {t('pleaseRefreshPage')}
          </p>
        </div>
      </div>
    );
  }

  const renderComponent = (component: Component) => {
    // Map the component type from the API to the correct component type
    const componentType = component.type;
    
    // Debug log to see what components are being returned
    if (process.env.NODE_ENV === 'development') {
      // Component debug info available in development
    }
    
    switch (componentType) {
      case 'banner':
      case 'single_banner':
      case 'moving_group':
        return <BannerComponent key={component.id} component={component} />;
      
      case 'reviews':
        return <ReviewsComponent key={component.id} component={component} />;
      
      case 'product-list':
      case 'product_list':
        return <ProductListComponent key={component.id} component={component} />;
      
      case 'feature':
      case 'features':
        return <FeaturesComponent key={component.id} component={component} />;
      
      case 'custom':
      default:
        // Custom component or unknown type - show debug info
        return (
          <section key={component.id} className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-card p-6 rounded-2xl border-2 border-dashed border-border">
                <div className="text-center">
                  <CogIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {component.name || t('customComponent')}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {t('componentType')}: {componentType}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm font-medium text-primary mb-2">
                        Debug Info (Development Only)
                      </summary>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(component, null, 2)}
                      </pre>
                    </details>
                  )}
                  {component.data.content && (
                    <div className="mt-4 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: component.data.content }} />
                  )}
                </div>
              </div>
            </div>
          </section>
        );
    }
  };

  if (!components || components.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HeroSection />
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-gray-400 mb-6">
            <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {t('noContent')}
          </h1>
          <p className="text-white/70 mb-6 leading-relaxed">
            {t('noContentDescription')}
          </p>
          
          {/* Store Management Link */}
          <div className="bg-muted/50 rounded-2xl p-6">
            <PlusIcon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">
              {t('storeOwner')}
            </h3>
            <p className="text-sm text-white/70 mb-4">
              {t('addComponentsInstructions')}
            </p>
            <Link
              href="https://app.rmz.gg"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <CogIcon className="h-4 w-4" />
              <span>{t('manageStore')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sort components by sort_order
  const sortedComponents = [...components].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="min-h-screen">
      <HeroSection />
      {sortedComponents.map(renderComponent)}

      {/* WhatsApp Contact Section */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="glass-card bg-gradient-to-l from-emerald-700 to-emerald-500 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 py-10 px-6 md:px-12 shadow-lg border border-emerald-500/30">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <a
              href="https://wa.me/966564353553"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white text-emerald-600 text-lg font-bold rounded-full px-8 py-4 shadow hover:bg-zinc-100 transition-colors border-2 border-emerald-400"
            >
              <span>الواتساب</span>
              <FaWhatsapp className="w-6 h-6" />
              <span className="text-2xl">←</span>
            </a>
            <div className="flex items-center gap-5 text-white text-2xl mt-4 md:mt-0">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="TikTok"><FaTiktok /></a>
              <a href="#" aria-label="Snapchat"><FaSnapchatGhost /></a>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center md:text-right w-full md:w-auto">تواصل معنا لأي مساعدة</h2>
        </div>
      </section>
    </div>
  );
}
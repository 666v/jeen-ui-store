'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '@/lib/store-api';
import Link from 'next/link';
import { CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageProvider';

export default function ClientPagesPage() {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'pages': 'Pages',
        'browse_all_pages': 'Browse all pages',
        'read_more': 'Read More',
        'no_pages_available': 'No pages available',
        'check_back_later_for_new_pages': 'Check back later for new pages.'
      },
      ar: {
        'pages': 'الصفحات',
        'browse_all_pages': 'تصفح جميع الصفحات',
        'read_more': 'اقرأ المزيد',
        'no_pages_available': 'لا توجد صفحات متاحة',
        'check_back_later_for_new_pages': 'تفقد مرة أخرى لاحقاً لصفحات جديدة.'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card p-6 rounded-lg border">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('pages')}</h1>
          <p className="text-muted-foreground">
            {t('browse_all_pages')}
          </p>
        </div>

        {pages && pages.length > 0 ? (
          <div className="space-y-6">
            {pages.map((page: any) => (
              <div
                key={page.id}
                className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <DocumentTextIcon className="h-6 w-6 text-primary mr-3" />
                      <Link
                        href={`/pages/${page.slug}`}
                        className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {page.title}
                      </Link>
                    </div>
                    
                    {page.description && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {page.description}
                      </p>
                    )}
                    
                    {page.created_at && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(page.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href={`/pages/${page.slug}`}
                    className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t('read_more')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">
              {t('no_pages_available')}
            </h2>
            <p className="text-muted-foreground">
              {t('check_back_later_for_new_pages')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
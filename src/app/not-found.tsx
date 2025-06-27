'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageProvider';

export default function NotFound() {
  const { locale } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'page_not_found': 'الصفحة غير موجودة',
        'page_missing': 'الصفحة التي تبحث عنها غير موجودة',
        'back_home': 'العودة للرئيسية'
      },
      en: {
        'page_not_found': 'Page Not Found',
        'page_missing': 'The page you are looking for does not exist',
        'back_home': 'Go Home'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">{t('page_not_found')}</h2>
        <p className="text-white/70 mb-8">{t('page_missing')}</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
          <HomeIcon className="w-4 h-4 mr-2" />
          {t('back_home')}
        </Link>
      </div>
    </div>
  );
}
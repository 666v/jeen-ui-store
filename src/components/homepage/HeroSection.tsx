import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/lib/useTranslation';

export default function HeroSection() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  // Simple cursor positions
  const [cursor1, setCursor1] = useState({ x: 20, y: 30 });
  const [cursor2, setCursor2] = useState({ x: 60, y: 50 });
  const [cursor3, setCursor3] = useState({ x: 40, y: 70 });

  // Move cursors randomly
  useEffect(() => {
    const moveCursor = (setCursor: any) => {
      setCursor({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 80) + 10,
      });
    };

    const interval1 = setInterval(() => moveCursor(setCursor1), 3000);
    const interval2 = setInterval(() => moveCursor(setCursor2), 4000);
    const interval3 = setInterval(() => moveCursor(setCursor3), 2500);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
      clearInterval(interval3);
    };
  }, []);

  return (
    <section className="w-full flex flex-col items-center justify-center min-h-[60vh] py-16 sm:py-28 px-4 relative overflow-hidden">
      {/* Moving cursors */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cursor 1 */}
        <div 
          className="absolute transition-all duration-1000 ease-out"
          style={{ left: `${cursor1.x}%`, top: `${cursor1.y}%` }}
        >
          <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
          <div className="absolute top-4 left-4 bg-emerald-50/90 backdrop-blur-sm text-emerald-800 text-xs px-4 py-2 rounded-full shadow-lg border border-emerald-200/50">
            <span className="font-medium">أحمد</span>
          </div>
        </div>

        {/* Cursor 2 */}
        {/* <div 
          className="absolute transition-all duration-1000 ease-out"
          style={{ left: `${cursor2.x}%`, top: `${cursor2.y}%` }}
        >
          <div className="w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-lg"></div>
          <div className="absolute top-4 left-4 bg-rose-50/90 backdrop-blur-sm text-rose-800 text-xs px-4 py-2 rounded-full shadow-lg border border-rose-200/50">
            <div className="flex items-center gap-2">
              <span className="font-medium">علي </span>
            </div>
          </div>
        </div> */}

        {/* Cursor 3 */}
        <div 
          className="absolute transition-all duration-1000 ease-out"
          style={{ left: `${cursor3.x}%`, top: `${cursor3.y}%` }}
        >
          <div className="w-3 h-3 bg-sky-500 rounded-full border-2 border-white shadow-lg"></div>
          <div className="absolute top-4 left-4 bg-sky-50/90 backdrop-blur-sm text-sky-800 text-xs px-4 py-2 rounded-full shadow-lg border border-sky-200/50">
            <span className="font-medium">علي</span>
          </div>
        </div>
      </div>

      {/* Pill badge */}
      <div className="flex items-center justify-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 text-emerald-400 text-xs font-semibold shadow">
          <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs font-bold mr-2">{t('hero.badgeNew')}</span>
          {t('hero.badgeAnnouncement')}
          <svg className="w-4 h-4 ml-2 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
      
      {/* Headline */}
      <h1 className="text-center text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
        {t('hero.headline1')}
        <br className="hidden sm:block" />
        {t('hero.headline2')} <span className="text-emerald-400">{t('hero.headlineHighlight')}</span>
      </h1>
      
      {/* Subheading */}
      <p className="text-center text-lg sm:text-xl text-zinc-300 max-w-2xl mb-10">
        {t('hero.subheading')}
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link href="/products">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {t('hero.ctaPrimary')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </Link>
        <Link href="#learn-more">
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {t('hero.ctaSecondary')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </Link>
      </div>
    </section>
  );
} 
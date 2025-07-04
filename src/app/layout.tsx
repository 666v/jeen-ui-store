import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/components/LanguageProvider';
import { StoreProvider } from '@/components/StoreProvider';
import { getStoreSSRData, generateStoreMetaTags, generateStoreStructuredData, getStoreFavicons } from '@/lib/ssr';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

// Dynamic metadata generation based on store data
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();

  if (!store) {
    // Fallback metadata if store data is not available
    return {
      icons: {
      },
    };
  }

  const metaTags = generateStoreMetaTags(store);
  const favicons = getStoreFavicons(store);

  return {
    title: {
      template: `%s | ${store?.name || 'Digital Store'}`,
      default: store?.name || 'Digital Store',
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: store?.name || 'Digital Store',
    },
    formatDetection: {
      telephone: false,
    },
    // verification: {
    //   google: store.seo?.google_analytics_id,
    // },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStoreSSRData();
  const structuredData = store ? generateStoreStructuredData(store) : [];

  return (
    <html suppressHydrationWarning lang={store?.language || 'en'} dir={store?.language === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        {/* Critical RTL/LTR script - must run before page renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Only apply basic RTL/LTR to prevent layout shift
                  // Don't change language to avoid hydration mismatch
                  var serverLang = '${store?.language || 'en'}';
                  var serverDir = '${store?.language === 'ar' ? 'rtl' : 'ltr'}';

                  // Set basic attributes - React will handle language switching after hydration
                  document.documentElement.lang = serverLang;
                  document.documentElement.dir = serverDir;

                  // Apply Tajawal font for both languages to prevent font flashing
                  document.documentElement.className = document.documentElement.className.replace(/(font-inter|font-arabic|font-tajawal)/g, '');
                  document.documentElement.classList.add('font-tajawal');
                } catch (e) {
                  // Fallback if anything goes wrong
                  document.documentElement.dir = '${store?.language === 'ar' ? 'rtl' : 'ltr'}';
                  document.documentElement.lang = '${store?.language || 'en'}';
                }
              })();
            `,
          }}
        />

        {/* Preload critical resources */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://cdn.rmz.gg" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//cdn.rmz.gg" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* Google Analytics - TODO: Add back when SEO settings are available in API */}
        {/* Google Tag Manager - TODO: Add back when SEO settings are available in API */}
        {/* Facebook Pixel - TODO: Add back when SEO settings are available in API */}

        {/* Structured Data */}
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(data),
            }}
          />
        ))}
      </head>
      <body className={`${inter.variable} ${tajawal.variable}`} style={{ backgroundColor: store?.theme?.color || undefined }}>
        {/* Google Tag Manager (noscript) - TODO: Add back when SEO settings are available in API */}

        <StoreProvider store={store}>
          <LanguageProvider initialLanguage={store?.language}>
            <Providers>
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 to-zinc-900 text-white relative overflow-hidden">
                {/* Liquid Glass Background Pattern */}
                <div className="fixed inset-0 opacity-30 dark:opacity-20">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 pb-20 sm:pb-0">
                    {children}
                  </main>
                  <Footer />
                  <MobileTabBar />
                </div>
              </div>
              <Toaster />
            </Providers>
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

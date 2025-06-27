'use client';

import { useLanguage } from '@/components/LanguageProvider';

interface Feature {
  id?: number;
  title: string;
  description: string;
  icon: string;
  sort_order?: number;
}

interface FeaturesComponentProps {
  component: {
    id: number;
    type: string;
    name: string;
    data: {
      features: Feature[];
      settings: any;
    };
  };
}

export default function FeaturesComponent({ component }: FeaturesComponentProps) {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'storeFeatures': 'Store Features',
        'storeFeaturesDescription': 'Discover the unique features that make our store stand out and provide the best experience for you.',
      },
      ar: {
        'storeFeatures': 'مميزات المتجر',
        'storeFeaturesDescription': 'اكتشف الميزات الفريدة التي تجعل متجرنا مميزًا وتوفر لك أفضل تجربة.',
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || translations['en'][key];
  };
  const features = component.data.features || [];

  if (!features || features.length === 0) {
    return null;
  }

  const isRTL = locale === 'ar';

  return (
    <section className="py-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {t('storeFeatures')}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg sm:text-xl">
            {t('storeFeaturesDescription')}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.id || index}
                className="flex flex-col items-center text-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl group"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 shadow-inner mb-6 group-hover:bg-primary/20 transition-all duration-300">
                  {feature.icon ? (
                    <i className={`${feature.icon} text-3xl text-primary group-hover:scale-110 transition-transform duration-300`} />
                  ) : (
                    <div className="w-10 h-10 bg-primary/20 rounded-full" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                {/* Description */}
                <p className="text-white/80 text-base sm:text-lg leading-relaxed group-hover:text-white/90 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

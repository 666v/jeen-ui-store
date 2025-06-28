'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/lib/useTranslation';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  TruckIcon, 
  ClockIcon, 
  StarIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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

// Icon mapping for better visual consistency
const iconMap: { [key: string]: any } = {
  'fas fa-shield-alt': ShieldCheckIcon,
  'fas fa-truck': TruckIcon,
  'fas fa-clock': ClockIcon,
  'fas fa-star': StarIcon,
  'fas fa-magic': SparklesIcon,
  'fas fa-bolt': BoltIcon,
  'fas fa-heart': HeartIcon,
  'fas fa-globe': GlobeAltIcon,
  'fas fa-lock': ShieldCheckIcon,
  'fas fa-shipping-fast': TruckIcon,
  'fas fa-headset': ClockIcon,
  'fas fa-award': StarIcon,
  'fas fa-rocket': SparklesIcon,
  'fas fa-zap': BoltIcon,
  'fas fa-thumbs-up': HeartIcon,
  'fas fa-world': GlobeAltIcon,
};

export default function FeaturesComponent({ component }: FeaturesComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const features = component.data.features || [];

  if (!features || features.length === 0) {
    return null;
  }

  const isRTL = locale === 'ar';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const gradientColors = [
    'from-emerald-500/20 via-emerald-600/10 to-transparent',
    'from-blue-500/20 via-blue-600/10 to-transparent',
    'from-purple-500/20 via-purple-600/10 to-transparent',
    'from-pink-500/20 via-pink-600/10 to-transparent',
    'from-orange-500/20 via-orange-600/10 to-transparent',
    'from-cyan-500/20 via-cyan-600/10 to-transparent',
  ];

  return (
    <section className="relative py-24 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Elements */}
      <div className="absolute inset-0  from-zinc-900/50 via-zinc-900/30 to-black/50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-6">
            <SparklesIcon className="w-3 h-3" />
            <span>{t('common.storeFeatures')}</span>
          </div>
          
          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
              {t('common.storeFeatures')}
            </span>
          </h2>
          
          {/* Decorative Line */}
          <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          
          {/* Subtitle */}
          <p className="text-zinc-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t('common.storeFeaturesDescription')}
          </p>
        </motion.div>

        {/* Modern Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || SparklesIcon;
            const gradientColor = gradientColors[index % gradientColors.length];
            
            return (
              <motion.div
                key={feature.id || index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Feature Card */}
                <div className="relative h-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 transition-all duration-500 hover:border-emerald-500/30 hover:bg-zinc-900/60 overflow-hidden">
                  
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                      <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-500">
                        <IconComponent className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-100 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-zinc-300 leading-relaxed group-hover:text-zinc-200 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Section */}
        {/* <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="text-zinc-300 text-sm font-medium">
              {locale === 'ar' ? 'اكتشف المزيد من المميزات' : 'Discover more features'}
            </span>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}

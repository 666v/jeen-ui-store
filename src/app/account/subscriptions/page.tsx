'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/store-api';
import AccountLayout from '@/components/layout/AccountLayout';
import { useLanguage } from '@/components/LanguageProvider';

export default function SubscriptionsPage() {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'my_subscriptions': 'My Subscriptions',
        'active': 'Active',
        'inactive': 'Inactive',
        'price': 'Price',
        'expires': 'Expires',
        'duration': 'Duration',
        'days': 'days',
        'no_active_subs': 'No Active Subscriptions',
        'no_active_subs_desc': "You don't have any active subscriptions"
      },
      ar: {
        'my_subscriptions': 'اشتراكاتي',
        'active': 'نشط',
        'inactive': 'غير نشط',
        'price': 'السعر',
        'expires': 'ينتهي في',
        'duration': 'المدة',
        'days': 'أيام',
        'no_active_subs': 'لا توجد اشتراكات نشطة',
        'no_active_subs_desc': 'ليس لديك أي اشتراكات نشطة'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      // Placeholder until subscriptions API is implemented
      return [];
    },
  });

  return (
    <AccountLayout>
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8">
        <h3 className="text-2xl font-extrabold text-white mb-6">{t('my_subscriptions')}</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-2 border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/60"></div>
            ))}
          </div>
        ) : subscriptions?.length ? (
          <div className="space-y-4">
            {subscriptions.map((subscription: any) => (
              <div key={subscription.id} className="border-2 border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/60 hover:shadow-emerald-500/10 transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{subscription.product?.name}</h4>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                    subscription.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400' : 'bg-red-500/10 text-red-400 border border-red-400'
                  }`}>
                    {subscription.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-zinc-400">{t('price')}</span>
                    <p className="font-bold text-white">ر.س{(subscription.price?.formatted as string)?.replace('$', '').replace('USD', '').replace('ر.س', '').trim() || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-400">{t('expires')}</span>
                    <p className="font-bold text-white">{new Date(subscription.ends_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-400">{t('duration')}</span>
                    <p className="font-bold text-white">{subscription.duration} {t('days')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('no_active_subs')}</h3>
            <p className="text-zinc-400 mb-6">{t('no_active_subs_desc')}</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
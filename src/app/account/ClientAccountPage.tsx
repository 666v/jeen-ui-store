'use client';

import { useState, useEffect } from 'react';
import { useAuth, authApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AccountLayout from '@/components/layout/AccountLayout';
import { useLanguage } from '@/components/LanguageProvider';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'personal_info': 'Personal Information',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'email': 'Email',
        'phone': 'Phone',
        'phone_cannot_change': 'Phone number cannot be changed',
        'update_profile': 'Update Profile',
        'updating': 'Updating...',
        'loading_account': 'Loading account information...',
        'redirecting': 'Redirecting...'
      },
      ar: {
        'personal_info': 'المعلومات الشخصية',
        'first_name': 'الاسم الأول',
        'last_name': 'اسم العائلة',
        'email': 'البريد الإلكتروني',
        'phone': 'الهاتف',
        'phone_cannot_change': 'لا يمكن تغيير رقم الهاتف',
        'update_profile': 'تحديث الملف الشخصي',
        'updating': 'جارٍ التحديث...',
        'loading_account': 'جاري تحميل معلومات الحساب...',
        'redirecting': 'جاري التحويل...'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };
  const [isUpdating, setIsUpdating] = useState(false);

  const { customer, updateCustomer, isAuthenticated, isLoading: authLoading } = useAuth();

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    },
  });

  // Reset form when customer data changes
  useEffect(() => {
    if (customer) {
      profileForm.reset({
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
    }
  }, [customer, profileForm]);

  // Redirect if not authenticated (but not while loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated && typeof window !== 'undefined') {
      // Redirect to home page or show login modal
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      const updatedCustomer = await authApi.updateProfile(data);
      updateCustomer(updatedCustomer);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
    setIsUpdating(false);
  };

  // Show loading state if auth is loading or customer data is not loaded
  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading_account')}</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect will happen in useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900/60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-2xl p-8 mt-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-extrabold mb-3 shadow-lg">
            {customer?.first_name?.charAt(0)}{customer?.last_name?.charAt(0)}
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-1">{t('personal_info')}</h3>
          <span className="text-zinc-400">{customer?.email}</span>
        </div>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('first_name')}</label>
              <input
                type="text"
                {...profileForm.register('firstName')}
                className="w-full px-4 py-3 bg-zinc-800/60 text-white border-2 border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              {profileForm.formState.errors.firstName && (
                <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t('last_name')}</label>
              <input
                type="text"
                {...profileForm.register('lastName')}
                className="w-full px-4 py-3 bg-zinc-800/60 text-white border-2 border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              {profileForm.formState.errors.lastName && (
                <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">{t('email')}</label>
            <input
              type="email"
              {...profileForm.register('email')}
              className="w-full px-4 py-3 bg-zinc-800/60 text-white border-2 border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            {profileForm.formState.errors.email && (
              <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">{t('phone')}</label>
            <input
              type="text"
              value={customer?.phone && customer?.country_code ? `+${customer.country_code}${customer.phone}` : ''}
              disabled
              className="w-full px-4 py-3 border-2 border-zinc-700 rounded-xl bg-zinc-800/40 text-zinc-400"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            <p className="text-sm text-zinc-500 mt-1">{t('phone_cannot_change')}</p>
          </div>
          <Button type="submit" disabled={isUpdating} className="w-full py-3 text-lg font-bold rounded-xl">
            {isUpdating ? t('updating') : t('update_profile')}
          </Button>
        </form>
      </div>
    </AccountLayout>
  );
}
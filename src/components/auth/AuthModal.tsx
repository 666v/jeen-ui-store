'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/ui/otp-input';
import { authApi, useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';
import { devLog, devWarn } from '@/lib/console-branding';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useLanguage } from '@/components/LanguageProvider';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import Image from 'next/image';
import { useStore } from '@/components/StoreProvider';

const otpSchema = z.object({
  otp: z.string().min(4, 'OTP is required'),
});

const registrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required').optional(),
  last_name: z.string().optional(),
});

type OTPFormData = z.infer<typeof otpSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'login_or_register': 'Login or Register',
        'send_verification_code': 'Send Verification Code',
        'enter_verification_code': 'Enter Verification Code',
        'complete_registration': 'Complete Registration',
        'creating_account': 'Creating Account...',
        'complete_registration_button': 'Complete Registration',
        'verification_code_sent': 'Verification code sent',
        'verifying': 'Verifying code...',
      },
      ar: {
        'login_or_register': 'تسجيل الدخول أو إنشاء حساب',
        'send_verification_code': 'إرسال رمز التحقق',
        'enter_verification_code': 'أدخل رمز التحقق',
        'complete_registration': 'إكمال التسجيل',
        'creating_account': 'جاري إنشاء الحساب...',
        'complete_registration_button': 'إكمال التسجيل',
        'verification_code_sent': 'تم إرسال رمز التحقق',
        'change_number': 'تغيير الرقم',
        'enter_code_label': 'أدخل الرمز المرسل إلى رقمك',
        'resend_code': 'إعادة إرسال الرمز',
        'resend_code_cooldown': 'إعادة إرسال الرمز ({seconds}s)',
        'complete_profile': 'أكمل ملفك الشخصي',
        'verify_code': 'تحقق من الرمز',
        'verifying': 'التحقق من الرمز...',
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || translations['en'][key];
  };
  const [step, setStep] = useState<'phone' | 'otp' | 'registration'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const { setAuth } = useAuth();
  const { store } = useStore();

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Countdown timer effect for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Countdown timer effect for verification attempts
  useEffect(() => {
    if (verificationCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationCooldown(verificationCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCooldown]);

  const resetModal = () => {
    setStep('phone');
    setIsLoading(false);
    setPhoneNumber('');
    setPhoneValue('');
    setPhoneError('');
    setOtpValue('');
    setSessionToken('');
    setResendCooldown(0);
    setVerificationAttempts(0);
    setOtpSentTime(null);
    setVerificationCooldown(0);
    otpForm.reset();
    registrationForm.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!phoneValue) {
      setPhoneError('Please enter a phone number');
      return;
    }

    // Validate phone number using libphonenumber-js
    if (!isValidPhoneNumber(phoneValue)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Parse phone number using libphonenumber-js
      const parsedPhone = parsePhoneNumber(phoneValue);

      if (!parsedPhone) {
        setPhoneError('Invalid phone number format');
        setIsLoading(false);
        return;
      }

      // Format exactly as backend expects
      const country_code = String(parsedPhone.countryCallingCode); // "966", "973", etc.
      const phone = String(parsedPhone.nationalNumber); // "50708824", etc.

      devLog('Phone data being sent:', {
        country_code,
        phone,
        original: phoneValue,
        debug: {
          countryCallingCode: parsedPhone.countryCallingCode,
          nationalNumber: parsedPhone.nationalNumber,
          country: parsedPhone.country
        }
      });

      const response = await authApi.initiateAuth('phone', { country_code, phone });

      const sessionTokenValue = response.session_token;

      setSessionToken(sessionTokenValue);
      setPhoneNumber(phoneValue);
      setStep('otp');
      setResendCooldown(30); // Start cooldown when OTP is sent
      setOtpSentTime(Date.now()); // Track when OTP was sent
      setVerificationAttempts(0); // Reset attempts for new OTP
      toast.success(t('verification_code_sent'));
    } catch (error: any) {
      devWarn('Phone submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';

      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('number')) {
        setPhoneError(errorMessage);
      }
    }
    setIsLoading(false);
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    // Check if OTP has expired (5 minutes)
    if (otpSentTime && Date.now() - otpSentTime > 5 * 60 * 1000) {
      toast.error('Verification code has expired. Please request a new one.');
      return;
    }

    // Check if too many verification attempts
    if (verificationAttempts >= 3) {
      toast.error('Too many failed attempts. Please request a new code.');
      return;
    }

    // Check verification cooldown
    if (verificationCooldown > 0) {
      toast.error(`Please wait ${verificationCooldown} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    try {

      if (!sessionToken) {
        toast.error('Session token is missing. Please restart authentication.');
        setIsLoading(false);
        return;
      }

      // Ensure cart token is synced before authentication
      const { syncCartToken } = useCart.getState();
      syncCartToken();

      const response = await authApi.verifyOTP(data.otp, sessionToken);

      if (response.type === 'new' && response.requires_registration) {
        setSessionToken(response.session_token || sessionToken);
        setStep('registration');
        toast.info('Please complete your registration');
      } else if (response.type === 'authenticated' && response.token && response.customer) {
        devLog('🔐 AuthModal: Authentication successful, cart_token:', response.cart_token?.substring(0, 10) + '...');
        setAuth(response.token, response.customer);

        // Handle cart after authentication - preserve guest cart
        const { cart_token: guestCartToken, fetchCart } = useCart.getState();
        devLog('🔐 AuthModal: Guest cart token before auth:', guestCartToken?.substring(0, 10) + '...');
        devLog('🔐 AuthModal: Auth response cart token:', response.cart_token?.substring(0, 10) + '...');
        
        // Keep using the guest cart token - the backend should merge carts server-side
        // Don't overwrite the guest cart token with the auth response token
        if (guestCartToken) {
          devLog('🔐 AuthModal: Preserving guest cart token and fetching updated cart');
          // Just fetch the cart - the backend should have merged it with the user's account
          fetchCart().catch(devWarn);
        } else if (response.cart_token) {
          // Only set the auth cart token if we don't have a guest cart
          const { setCartToken } = useCart.getState();
          devLog('🔐 AuthModal: No guest cart, using auth response cart token');
          setCartToken(response.cart_token);
          fetchCart().catch(devWarn);
        }

        setTimeout(() => {
          const authState = useAuth.getState();
        }, 50);

        toast.success(t('login_successful'));
        handleClose();
        onSuccess?.();
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      // Increment attempts and set cooldown
      const newAttempts = verificationAttempts + 1;
      setVerificationAttempts(newAttempts);
      
      // Set progressive cooldown based on attempts
      if (newAttempts === 1) {
        setVerificationCooldown(5); // 5 seconds after first failure
      } else if (newAttempts === 2) {
        setVerificationCooldown(10); // 10 seconds after second failure
      } else if (newAttempts >= 3) {
        setVerificationCooldown(30); // 30 seconds after third failure
      }
      
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
    setIsLoading(false);
  };

  const handleOtpComplete = async (otp: string) => {
    setOtpValue(otp);
    if (otp.length === 4 && verificationCooldown === 0) {
      await onOTPSubmit({ otp });
    }
  };

  const onRegistrationSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      // Ensure cart token is synced before registration
      const { syncCartToken } = useCart.getState();
      syncCartToken();
      
      const response = await authApi.completeRegistration(data as any, sessionToken);
      if (response.token && response.customer) {
        devLog('🔐 AuthModal: Registration successful, cart_token:', response.cart_token?.substring(0, 10) + '...');
        setAuth(response.token, response.customer);
        
        // Handle cart after registration - preserve guest cart
        const { cart_token: guestCartToken, fetchCart } = useCart.getState();
        devLog('🔐 AuthModal: Guest cart token before registration:', guestCartToken?.substring(0, 10) + '...');
        devLog('🔐 AuthModal: Registration response cart token:', response.cart_token?.substring(0, 10) + '...');
        
        // Keep using the guest cart token - the backend should merge carts server-side
        if (guestCartToken) {
          devLog('🔐 AuthModal: Preserving guest cart token and fetching updated cart');
          fetchCart().catch(devWarn);
        } else if (response.cart_token) {
          // Only set the registration cart token if we don't have a guest cart
          const { setCartToken } = useCart.getState();
          devLog('🔐 AuthModal: No guest cart, using registration response cart token');
          setCartToken(response.cart_token);
          fetchCart().catch(devWarn);
        }
        
        toast.success(t('registration_successful'));
        handleClose();
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  const resendOTP = async () => {
    if (!sessionToken) {
      toast.error('Session token is missing. Please restart authentication.');
      return;
    }

    if (resendCooldown > 0) {
      return; // Prevent resend during cooldown
    }

    try {
      await authApi.resendOTP(sessionToken);
      
      // Clear OTP input when new code is sent
      setOtpValue('');
      otpForm.setValue('otp', '');
      
      // Reset verification attempts and update OTP sent time
      setVerificationAttempts(0);
      setVerificationCooldown(0);
      setOtpSentTime(Date.now());
      
      toast.success('Verification code resent');
      setResendCooldown(30); // Set 30 second cooldown
    } catch (error: any) {
      // If we get 429 error, still set cooldown
      if (error.response?.status === 429) {
        setResendCooldown(30);
      }
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtpValue('');
    otpForm.reset();
  };

  // Real-time phone validation
  const handlePhoneChange = (value: string) => {
    setPhoneValue(value || '');
    setPhoneError(''); // Clear error when user starts typing
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-zinc-900/30 to-emerald-900/30 backdrop-blur-[6px]" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 shadow-2xl shadow-black/30 p-0 text-left align-middle transition-all relative">
                {/* Branding/logo section */}
                <div className="flex flex-col items-center justify-center pt-8 pb-2 px-6 border-b border-zinc-800/30 bg-zinc-900/80">
                  {store?.logo ? (
                    <Image src={store.logo} alt={store.name || 'Store Logo'} width={48} height={48} className="rounded-full shadow-md mb-2" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-md">
                      <span>{store?.name?.charAt(0) || 'S'}</span>
                    </div>
                  )}
                  <span className="text-lg font-semibold text-white mb-1">{store?.name || 'Welcome'}</span>
                </div>
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white">
                    {step === 'phone' && t('login_or_register')}
                    {step === 'otp' && t('enter_verification_code')}
                    {step === 'registration' && t('complete_registration')}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="px-6 pb-8 pt-2">
                  {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          {t('phone_number')}
                        </label>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="SA"
                          countries={[
                            // GCC Countries (First)
                            'SA', // Saudi Arabia
                            'AE', // United Arab Emirates
                            'KW', // Kuwait
                            'QA', // Qatar
                            'BH', // Bahrain
                            'OM', // Oman
                            // Other Arab Countries
                            'EG', // Egypt
                            'JO', // Jordan
                            'LB', // Lebanon
                            'IQ', // Iraq
                            'YE', // Yemen
                            'SY', // Syria
                            'PS', // Palestine
                            'MA', // Morocco
                            'DZ', // Algeria
                            'TN', // Tunisia
                            'LY', // Libya
                            'SD', // Sudan
                            'MR', // Mauritania
                            'DJ', // Djibouti
                            'SO', // Somalia
                            'KM', // Comoros
                          ]}
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          dir="ltr"
                          className={`phone-input w-full rounded-2xl px-4 py-3 text-base bg-zinc-800/60 text-white border-2 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm placeholder:text-zinc-400 transition-all ltr:pl-4 ltr:pr-12 text-left focus:border-emerald-500 hover:border-emerald-400`}
                          style={{
                            '--PhoneInputCountryFlag-height': '1.5em',
                            '--PhoneInputCountrySelectArrow-color': 'currentColor',
                            '--PhoneInput-color--focus': 'hsl(var(--ring))',
                            background: 'none',
                            color: 'inherit',
                            direction: 'ltr',
                            textAlign: 'left',
                          } as React.CSSProperties}
                          placeholder={locale === 'ar' ? 'أدخل رقم الجوال' : 'Enter phone number'}
                        />
                        {phoneError && (
                          <p className="text-destructive text-sm mt-1 flex items-center gap-1"><span className="w-4 h-4 inline-block bg-destructive rounded-full"></span>{phoneError}</p>
                        )}
                      </div>
                      <Button type="submit" className="w-full primary border border-zinc-800/50 text-white hover:text-white" disabled={isLoading}>
                        {isLoading ? t('sending') : t('send_verification_code')}
                      </Button>
                    </form>
                  )}
                  {step === 'otp' && (
                    <div>
                      <p className="text-zinc-400 text-center mb-6">
                        {t('verification_code_sent')} <br />
                        <span className="font-medium text-white">{phoneNumber || phoneValue || 'No phone number found'}</span>
                      </p>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-4 text-center">
                            {t('enter_code_label')}
                          </label>
                          <OTPInput
                            length={4}
                            value={otpValue}
                            onChange={setOtpValue}
                            onComplete={handleOtpComplete}
                            autoFocus
                            disabled={isLoading || verificationCooldown > 0}
                            className="mb-4 rounded-lg px-3 py-2 bg-zinc-800/30 text-zinc-200 border border-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-zinc-400 text-base"
                          />
                          {otpForm.formState.errors.otp && (
                            <p className="text-destructive text-sm mt-2 text-center flex items-center gap-1"><span className="w-4 h-4 inline-block bg-destructive rounded-full"></span>{otpForm.formState.errors.otp.message}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleOtpComplete(otpValue)}
                          className="w-full primary border border-zinc-800/50 text-white hover:text-white"
                          disabled={isLoading || otpValue.length !== 4 || verificationCooldown > 0}
                        >
                          {isLoading ? t('verifying') : 
                            verificationCooldown > 0 ? `${t('verify_code')} (${verificationCooldown}s)` :
                            t('verify_code')}
                        </Button>
                        <div className="flex justify-between text-sm">
                          <button
                            type="button"
                            onClick={goBackToPhone}
                            className="text-zinc-400 hover:text-white font-medium transition-colors"
                          >
                            ← {t('change_number')}
                          </button>
                          <button
                            type="button"
                            onClick={resendOTP}
                            disabled={resendCooldown > 0}
                            className={`font-medium transition-colors ${
                              resendCooldown > 0 
                                ? 'text-zinc-500 cursor-not-allowed' 
                                : 'text-emerald-500 hover:text-emerald-400 cursor-pointer'
                            }`}
                          >
                            {resendCooldown > 0 
                              ? `${t('resend_code')} (${resendCooldown}s)` 
                              : t('resend_code')
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 'registration' && (
                    <div>
                      <p className="text-zinc-400 text-center mb-6">
                        {t('complete_profile')}
                      </p>
                      <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1">
                            {t('email_address')}
                          </label>
                          <input
                            type="email"
                            {...registrationForm.register('email')}
                            className="w-full px-3 py-2 bg-zinc-800/30 text-zinc-200 border border-zinc-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-zinc-400 transition-all"
                            placeholder="your@email.com"
                          />
                          {registrationForm.formState.errors.email && (
                            <p className="text-destructive text-sm mt-1 flex items-center gap-1"><span className="w-4 h-4 inline-block bg-destructive rounded-full"></span>{registrationForm.formState.errors.email.message}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                              {t('first_name')}
                            </label>
                            <input
                              type="text"
                              {...registrationForm.register('name')}
                              className="w-full px-3 py-2 bg-zinc-800/30 text-zinc-200 border border-zinc-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-zinc-400 transition-all"
                              placeholder="John"
                            />
                            {registrationForm.formState.errors.name && (
                              <p className="text-destructive text-sm mt-1 flex items-center gap-1"><span className="w-4 h-4 inline-block bg-destructive rounded-full"></span>{registrationForm.formState.errors.name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                              {t('last_name')}
                            </label>
                            <input
                              type="text"
                              {...registrationForm.register('last_name')}
                              className="w-full px-3 py-2 bg-zinc-800/30 text-zinc-200 border border-zinc-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-zinc-400 transition-all"
                              placeholder="Doe"
                            />
                            {registrationForm.formState.errors.last_name && (
                              <p className="text-destructive text-sm mt-1 flex items-center gap-1"><span className="w-4 h-4 inline-block bg-destructive rounded-full"></span>{registrationForm.formState.errors.last_name.message}</p>
                            )}
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-zinc-900/80 border border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/50" disabled={isLoading}>
                          {isLoading ? t('creating_account') : t('complete_registration_button')}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
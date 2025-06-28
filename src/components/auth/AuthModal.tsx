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
import { useTranslation } from '@/lib/useTranslation';

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
  const { t } = useTranslation();
  const { locale } = useLanguage();
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
      toast.success(t('auth.verification_code_sent'));
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
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {step === 'phone' && t('auth.login_or_register')}
                      {step === 'otp' && t('auth.enter_verification_code')}
                      {step === 'registration' && t('auth.complete_registration')}
                    </h2>
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
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {t('auth.phone')}
                      </label>
                      <PhoneInput
                          country={'sa'}
                        value={phoneValue}
                        onChange={handlePhoneChange}
                          inputClass="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                          containerClass="w-full"
                          buttonClass="bg-zinc-800/50 border border-zinc-700/50 rounded-l-xl text-white hover:bg-zinc-800/70 transition-colors"
                          dropdownClass="bg-zinc-900/95 border border-zinc-800/50 rounded-xl shadow-2xl"
                          searchClass="bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          enableSearch={true}
                          searchPlaceholder="Search country..."
                          preferredCountries={['sa', 'ae', 'kw', 'bh', 'om', 'qa']}
                          disabled={isLoading}
                      />
                      {phoneError && (
                          <p className="mt-2 text-sm text-red-400">{phoneError}</p>
                      )}
                    </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? t('common.loading') : t('auth.send_verification_code')}
                      </button>
                  </form>
                )}
                {step === 'otp' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-zinc-400 text-center mb-6">
                          {t('auth.verification_code_sent')} <br />
                          <span className="font-medium text-white">{phoneNumber || phoneValue || 'No phone number found'}</span>
                        </p>
                        <p className="text-zinc-400 text-center mb-6">
                          {t('auth.enter_code_label')}
                        </p>
                        <OTPInput
                          length={6}
                          onComplete={handleOtpComplete}
                          disabled={isLoading || verificationCooldown > 0}
                          autoFocus
                          className="justify-center"
                        />
                      </div>

                      <button
                        onClick={() => otpForm.handleSubmit(onOTPSubmit)()}
                        disabled={isLoading || verificationCooldown > 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? t('auth.verifying') :
                        verificationCooldown > 0 ? `${t('auth.verify_code')} (${verificationCooldown}s)` :
                        t('auth.verify_code')}
                      </button>

                      <div className="text-center space-y-3">
                        <button
                          type="button"
                          onClick={goBackToPhone}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                        >
                          ← {t('auth.change_number')}
                        </button>
                        <div>
                        <button
                          type="button"
                          onClick={resendOTP}
                          disabled={resendCooldown > 0}
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendCooldown > 0 
                              ? `${t('auth.resend_code')} (${resendCooldown}s)`
                              : t('auth.resend_code')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {step === 'registration' && (
                    <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-6">
                  <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {t('auth.complete_profile')}
                        </h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {t('auth.email')}
                        </label>
                        <input
                          type="email"
                          {...registrationForm.register('email')}
                          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                          placeholder="your@email.com"
                          disabled={isLoading}
                        />
                        {registrationForm.formState.errors.email && (
                          <p className="mt-2 text-sm text-red-400">{registrationForm.formState.errors.email.message}</p>
                        )}
                      </div>

                        <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {t('auth.firstName')}
                          </label>
                          <input
                            type="text"
                            {...registrationForm.register('name')}
                          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                          placeholder="Your first name"
                          disabled={isLoading}
                          />
                          {registrationForm.formState.errors.name && (
                          <p className="mt-2 text-sm text-red-400">{registrationForm.formState.errors.name.message}</p>
                          )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? t('auth.creating_account') : t('auth.complete_registration_button')}
                      </button>
                    </form>
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
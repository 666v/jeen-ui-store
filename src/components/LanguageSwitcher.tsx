'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { XMarkIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const languageNames = {
  en: 'English',
  ar: 'العربية'
};

const languageFlags = {
  en: '🇺🇸',
  ar: '🇸🇦'
};

const supportedLocales = ['en', 'ar'];

// Simple Portal utility
function Portal({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  const portalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(children, portalRoot);
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selected, setSelected] = useState(locale);

  useEffect(() => {
    setSelected(locale);
  }, [locale]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsAnimating(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      document.body.style.overflow = 'unset';
    }, 200);
  };

  const handleConfirm = () => {
    setLocale(selected);
    closeModal();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  return (
    <>
      {/* Language Switcher Button in Top Bar */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
        aria-label="Switch Language"
        onClick={openModal}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {languageNames[locale as keyof typeof languageNames]}
        </span>
        <ChevronDownIcon className="h-3 w-3" />
      </Button>

      {/* Language Modal */}
      {isModalOpen && (
        <Portal>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
              className={`bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md transform transition-all duration-300 ease-out ${
                isAnimating
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 translate-y-4'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Select Language</h3>
                    <p className="text-sm text-zinc-400">Choose your preferred language</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-3">
                  {supportedLocales.map((lng, idx) => (
                    <button
                      key={lng}
                      onClick={() => setSelected(lng)}
                      className={`w-full p-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                        selected === lng
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700/50'
                      }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{languageFlags[lng as keyof typeof languageFlags]}</span>
                        <span className={`font-semibold text-lg ${selected === lng ? 'text-emerald-500' : 'text-white'}`}>{languageNames[lng as keyof typeof languageNames]}</span>
                      </div>
                      {selected === lng ? (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-200">
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-zinc-600 rounded-full group-hover:border-zinc-500 transition-colors duration-200" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Confirm Button */}
                <div className="mt-6 pt-4 border-t border-zinc-800/30 flex justify-end">
                  <Button
                    onClick={handleConfirm}
                    disabled={selected === locale}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

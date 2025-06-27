'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCurrency, Currency } from '@/lib/currency';
import { Button } from '@/components/ui/button';

// Simple Portal utility
function Portal({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  const portalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(children, portalRoot);
}

export default function CurrencySelector() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const {
    selectedCurrency,
    availableCurrencies,
    isLoading,
    setCurrency,
    loadCurrencies
  } = useCurrency();

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  const openModal = () => {
    if (availableCurrencies.length > 1) {
      setIsModalOpen(true);
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }, 200);
  };

  const handleCurrencyChange = async (currency: Currency) => {
    try {
      await setCurrency(currency);
      closeModal();
    } catch (error) {
      console.error('Error changing currency:', error);
    }
  };

  // Handle escape key
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

  // Loading state
  if (isLoading) {
    return (
      <div className="w-16 h-8 bg-zinc-800/50 animate-pulse rounded-lg"></div>
    );
  }

  // If no currencies are available, show default
  if (!selectedCurrency || !availableCurrencies || availableCurrencies.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="flex items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm border-zinc-800/50 text-zinc-300"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="text-sm font-medium">ر.س</span>
      </Button>
    );
  }

  return (
    <>
      {/* Currency Button in Top Bar */}
      <Button
        variant="outline"
        size="sm"
        onClick={openModal}
        disabled={isLoading || availableCurrencies.length <= 1}
        className="flex items-center space-x-2 bg-zinc-900/80 backdrop-blur-sm border-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {selectedCurrency?.symbol || 'ر.س'}
        </span>
        {availableCurrencies.length > 1 && (
          <ChevronDownIcon className="h-3 w-3" />
        )}
      </Button>

      {/* Currency Selection Modal - Using Portal-like positioning */}
      {isModalOpen && (
        <Portal>
          {/* Backdrop - Very high z-index */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          />

          {/* Modal Container - Very high z-index */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div 
              className={`bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-sm sm:max-w-md max-h-[80vh] sm:max-h-[70vh] transform transition-all duration-300 ease-out ${
                isAnimating 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 translate-y-4'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Select Currency</h3>
                    <p className="text-xs sm:text-sm text-zinc-400">Choose your preferred currency</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)] sm:max-h-[calc(70vh-140px)]">
                <div className="space-y-2 sm:space-y-3">
                  {availableCurrencies.map((currency, index) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency)}
                  disabled={isLoading}
                      className={`w-full p-3 sm:p-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                        selectedCurrency.code === currency.code 
                          ? 'bg-emerald-500/10 border border-emerald-500/20' 
                          : 'bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700/50'
                  } disabled:opacity-50`}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Currency Icon */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          selectedCurrency.code === currency.code 
                            ? 'bg-emerald-500/20' 
                            : 'bg-zinc-700/50'
                        }`}>
                          <span className={`text-base sm:text-lg font-bold transition-colors duration-200 ${
                            selectedCurrency.code === currency.code 
                              ? 'text-emerald-500' 
                              : 'text-zinc-300'
                          }`}>
                      {currency.symbol}
                          </span>
                    </div>

                        {/* Currency Details */}
                        <div className="text-left">
                          <div className={`text-sm sm:text-base font-semibold transition-colors duration-200 ${
                            selectedCurrency.code === currency.code 
                              ? 'text-emerald-500' 
                              : 'text-white'
                          }`}>
                      {currency.name}
                    </div>
                          <div className="text-xs sm:text-sm text-zinc-400">
                            {currency.code}
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedCurrency.code === currency.code ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center transition-all duration-200">
                          <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-zinc-600 rounded-full group-hover:border-zinc-500 transition-colors duration-200" />
                  )}
                </button>
              ))}
                </div>

                {/* Footer */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-800/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-zinc-400 space-y-1 sm:space-y-0">
                    <span>Exchange rates are updated regularly</span>
                    {selectedCurrency?.rate && (
                      <span className="text-emerald-500 font-medium">
                        1 SAR = {selectedCurrency.rate.toFixed(4)} {selectedCurrency.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

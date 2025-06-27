import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
import { useLanguage } from '@/components/LanguageProvider';

const translations = { en, ar };

export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { locale } = useLanguage();

  // Helper to resolve nested keys using dot notation
  function getNested(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNested(translations[locale as keyof typeof translations], key) ||
                        getNested(translations.en, key) ||
                        key;

    // If the translation is an object (not a string), return the key itself
    if (typeof translation === 'object' && translation !== null) {
      return key;
    }

    if (!params) return translation;

    // Simple parameter replacement
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), String(value));
    }, translation);
  };

  return { t, locale };
}
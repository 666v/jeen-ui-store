"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '@/components/LanguageProvider';

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const { locale } = useLanguage();
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'toggleTheme': 'Toggle theme',
        'lightTheme': 'Light',
        'darkTheme': 'Dark',
        'systemTheme': 'System',
      },
      ar: {
        'toggleTheme': 'تبديل النمط',
        'lightTheme': 'فاتح',
        'darkTheme': 'داكن',
        'systemTheme': 'النظام',
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || translations['en'][key];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggleTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100] min-w-[8rem]">
        <DropdownMenuItem onClick={() => setTheme("light")}>{t('lightTheme')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{t('darkTheme')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{t('systemTheme')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
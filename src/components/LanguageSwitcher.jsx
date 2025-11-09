import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ currentLanguage, onLanguageChange, variant = "default" }) {
  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'zh', label: 'Chinese', nativeLabel: '中文' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-stone-500" strokeWidth={1.5} />
      <div className="flex gap-2">
        {languages.map(({ code, nativeLabel }) => (
          <Button
            key={code}
            variant={currentLanguage === code ? variant : "outline"}
            size="sm"
            onClick={() => onLanguageChange(code)}
            className={currentLanguage === code && variant === "default" ? "bg-stone-900 hover:bg-stone-800" : ""}
          >
            {nativeLabel}
          </Button>
        ))}
      </div>
    </div>
  );
}
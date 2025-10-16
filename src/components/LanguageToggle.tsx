import { useTranslation } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const handleToggle = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <button 
      onClick={handleToggle}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors w-full group-data-[collapsible=icon]:justify-center"
      title={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
    >
      <span className={`text-sm transition-colors ${language === 'en' ? 'text-orange-500' : 'text-foreground/70'}`}>
        E
      </span>
      <span className={`text-sm transition-colors ${language === 'zh' ? 'text-orange-500' : 'text-foreground/70'}`}>
        中
      </span>
    </button>
  );
}

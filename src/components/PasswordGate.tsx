import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface PasswordGateProps {
  children: React.ReactNode;
  correctPassword: string; // The password to unlock the site
}

const PasswordGate = ({ children, correctPassword }: PasswordGateProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  // Check if already unlocked in session storage
  useEffect(() => {
    const unlocked = sessionStorage.getItem('site-unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      setIsUnlocked(true);
      sessionStorage.setItem('site-unlocked', 'true');
      setError('');
    } else {
      setError(t('password.incorrectPassword'));
      setPassword('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex flex-col items-center justify-center">
      {/* warm background */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <img src="/long_logo.svg" alt="BluePrint" className="h-8 object-contain" />
        
        {/* Tagline */}
        <div className="text-center space-y-1 max-w-lg">
          <p className="text-[14px] text-foreground/70 leading-tight">
            {t('password.tagline')}
          </p>
          <p className="text-[12px] text-foreground/60 leading-tight">
            {t('password.betaMessage')}
          </p>
        </div>
        
        {/* Password Input */}
        <form onSubmit={handleSubmit} style={{ width: '400px', maxWidth: '90vw' }}>
          <div className="relative">
            <input
              type="password"
              placeholder={t('password.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-white/70 px-4 py-2 text-[14px] text-foreground/80 placeholder:text-foreground/50 focus:outline-none focus:border-border shadow-sm backdrop-blur-sm"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground/80 text-sm"
            >
              →
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;


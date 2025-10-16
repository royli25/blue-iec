import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import QuarterlyTimeline from "@/components/QuarterlyTimeline";
import { useProfileContext } from "@/hooks/useProfileContext";
import { useTranslation } from "@/lib/i18n";
import { Layout } from "@/components/Layout";

const BLUEPRINT_PASSWORD = "blueprint2025"; // Change this to your desired password

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const { profileData } = useProfileContext();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  // Check if already unlocked in session storage
  useEffect(() => {
    const unlocked = sessionStorage.getItem('blueprint-page-unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === BLUEPRINT_PASSWORD) {
      setIsUnlocked(true);
      sessionStorage.setItem('blueprint-page-unlocked', 'true');
      setError('');
    } else {
      setError(t('blueprint.incorrectPassword'));
      setPassword('');
    }
  };

  return (
    <Layout showGrid={false}>
      {!isUnlocked ? (
        // Password Gate - Inline with page
        <div className="relative min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center">
          {/* warm background */}
          <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
          <div className="absolute inset-0 grid-bg opacity-70" />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <img src="/blueprint.png" alt="BluePrint" className="h-8 object-contain" />
            
            {/* Coming Soon Message */}
            <div className="text-center space-y-2 max-w-lg">
              <h2 className="text-[20px] font-semibold text-foreground/90">{t('blueprint.title')}</h2>
              <p className="text-[14px] text-foreground/70 leading-tight">
                {t('blueprint.comingSoon')}
              </p>
            </div>
            
            {/* Password Input */}
            <form onSubmit={handleSubmit} style={{ width: '400px', maxWidth: '90vw' }}>
              <div className="relative">
                <input
                  type="password"
                  placeholder={t('blueprint.enterPassword')}
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
      ) : (
        // Actual content when unlocked
        <div className="px-0 pt-4 pb-8">
          <div className="mx-auto max-w-none w-full">
            <div className="space-y-3" />
            {/* Quarterly timeline with side gutters */}
            <div className="mt-4 px-[7.5%]">
            {(() => {
              const now = new Date();
              const currentYear = now.getFullYear();
              let endYear: number | null = null;
              // Try to parse a 4-digit graduation year from profile
              const raw = profileData?.gradeLevel;
              if (raw) {
                const year = parseInt(String(raw), 10);
                if (!Number.isNaN(year) && year >= currentYear && year <= currentYear + 10) {
                  endYear = year;
                }
              }
              // Fallback to explicit 2028 based on this account
              if (!endYear) endYear = 2028;
              const startStr = `${currentYear}-01`;
              const endStr = `${endYear}-12`;
              return (
            <QuarterlyTimeline
              start={startStr}
              end={endStr}
              categories={["Milestones", "Webstore", "Self Serve", "Mobile", "Help Desk", "Infrastructure"]}
              items={[
                { id: 'm1', category: 'Milestones', label: 'Android Mobile App', start: `${new Date().getFullYear()}-02`, end: `${new Date().getFullYear()}-04` },
                { id: 'm2', category: 'Milestones', label: 'iOS App Launch', start: `${new Date().getFullYear()}-05`, end: `${new Date().getFullYear()}-06` },
                { id: 'w1', category: 'Webstore', label: 'Guest Checkout', start: `${new Date().getFullYear()}-07`, end: `${new Date().getFullYear()}-09` },
                { id: 's1', category: 'Self Serve', label: 'Single Sign-On', start: `${new Date().getFullYear()}-03`, end: `${new Date().getFullYear()}-03` },
                { id: 's2', category: 'Self Serve', label: 'Language Localization', start: `${new Date().getFullYear()}-03`, end: `${new Date().getFullYear()}-06` },
                { id: 'mb1', category: 'Mobile', label: 'iOS 1.0', start: `${new Date().getFullYear()}-05`, end: `${new Date().getFullYear()}-07` },
                { id: 'mb2', category: 'Mobile', label: 'Push Notifications', start: `${new Date().getFullYear()}-08`, end: `${new Date().getFullYear()}-10` },
                { id: 'hd1', category: 'Help Desk', label: 'Accessibility Improvements', start: `${new Date().getFullYear()}-04`, end: `${new Date().getFullYear()}-07` },
                { id: 'inf1', category: 'Infrastructure', label: 'Library Upgrades', start: `${new Date().getFullYear()}-06`, end: `${new Date().getFullYear()}-08` },
              ]}
            />
              );
            })()}
          </div>
        </div>
        </div>
      )}
    </Layout>
  );
};

export default PersonalBlueprint;

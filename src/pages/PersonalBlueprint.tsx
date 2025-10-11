import { useAuth } from "@/hooks/useAuth";
import QuarterlyTimeline from "@/components/QuarterlyTimeline";
import { useProfileContext } from "@/hooks/useProfileContext";
import { Layout } from "@/components/Layout";

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const { profileData } = useProfileContext();

  return (
    <Layout showGrid={false}>
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
    </Layout>
  );
};

export default PersonalBlueprint;

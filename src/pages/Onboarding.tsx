import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import AdmittedProfiles from "./AdmittedProfiles";

export default function Onboarding() {
  const navigate = useNavigate();
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const { user, signOut } = useAuth();
  const [showProfiles, setShowProfiles] = useState(false);

  return (
    <Layout showSidebar={false}>
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {/* Base panel */}
        <div className="absolute inset-0">
          {/* Panel 1: Onboarding controls (always visible) */}
          <div className="h-[100dvh] flex items-center justify-center">
            <div className="w-full max-w-md px-6">
              <div className="mb-6">
                <p className="text-[14px] leading-5 text-foreground/80 text-left">
                  <span className="font-semibold" style={{ color: '#C47646' }}>BluePrint</span> uses multi agents designed alongside admissions officers to create a plan to help you get admitted to your college of choice
                </p>
              </div>
              {/* Buttons: Join, Browse Admitted Profiles, Sign In */}
              <div className="grid grid-cols-1 gap-2 text-[12px]">
                <button
                  onClick={() => navigate('/join')}
                  className="w-full rounded-md border border-brand bg-brand px-4 py-1 text-[12px] text-brand-foreground shadow-sm hover:opacity-95"
                >
                  Join BluePrint
                </button>

                <button
                  onClick={() => setShowProfiles(true)}
                  className="w-full rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white"
                >
                  Browse Admitted Profiles
                </button>

                <button
                  onClick={() => navigate('/auth')}
                  className="w-full rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide-in overlay: Admitted Profiles */}
        {showProfiles && (
          <div className="absolute inset-0 bg-surface-muted/40">
            <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: 'translateX(0)' }}>
              <div className="h-[100dvh] w-full overflow-y-auto flex items-center justify-center px-2">
                <div className="w-full">
                  <AdmittedProfiles embedded />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


My
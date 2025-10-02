import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Timeline from "@/components/Timeline";
import GenerateLink from "@/components/GenerateLink";

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* top-right auth button / email */}
      <div className="absolute top-4 right-4 z-10 text-[12px]">
        {user ? (
          <span className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm">
            {user.email}
          </span>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="rounded-md border border-border bg-white/70 px-4 py-0 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white h-[24px] min-h-0 leading-none"
          >
            Log in
          </button>
        )}
      </div>

      {/* subtle warm background with grid */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* content */}
      <div className="relative px-6 pt-6 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-3">
            {/* Breadcrumb */}
            <div className="pb-2">
              <nav aria-label="Breadcrumb" className="text-[12px] text-foreground/70">
                <ol className="flex items-center gap-2">
                  <li>
                    <button onClick={() => navigate('/')} className="underline underline-offset-2 hover:opacity-80">Home</button>
                  </li>
                  <li className="text-foreground/60">/</li>
                  <li>
                    <span className="text-foreground/80">Personal Blueprint</span>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Header */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-foreground/90 mb-2">Personal Blueprint</h1>
              <GenerateLink 
                resourceType="personal_blueprint"
                title="Personal Blueprint"
                snapshot={{ user: user?.email, timestamp: new Date().toISOString() }}
              />
            </div>

            {/* Extended White Box */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)] overflow-hidden">
              <Timeline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBlueprint;

import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
      <div className="relative px-6 pt-12 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="pb-3">
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
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground/90 mb-2">Personal Blueprint</h1>
              <p className="text-foreground/70 text-sm">
                Your personalized roadmap to academic and career success.
              </p>
            </div>

            {/* Activities Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">
                    Add
                  </button>
                </div>
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Activity 1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <textarea 
                    placeholder="Description" 
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBlueprint;

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
        <div className="mx-auto max-w-4xl flex flex-col">
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
          
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground/90 mb-2">Personal Blueprint</h1>
              <p className="text-foreground/70 text-sm">
                Your personalized roadmap to academic and career success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Academic Profile Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">Academic Profile</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Track your academic achievements, test scores, and academic milestones.
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Profile →
                </button>
              </div>

              {/* Career Goals Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">Career Goals</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Define your career aspirations and create a roadmap to achieve them.
                </p>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Set Goals →
                </button>
              </div>

              {/* Extracurricular Activities Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">Activities</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Document your extracurricular activities, leadership roles, and achievements.
                </p>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Track Activities →
                </button>
              </div>

              {/* College Planning Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">College Planning</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Research colleges, track applications, and plan your college journey.
                </p>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Plan College →
                </button>
              </div>

              {/* Skills Development Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">Skills Development</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Identify and develop key skills for your academic and career success.
                </p>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Build Skills →
                </button>
              </div>

              {/* Progress Tracking Card */}
              <div className="rounded-xl border border-border/40 bg-white/70 backdrop-blur-sm shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground/90">Progress Tracking</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Monitor your progress and celebrate milestones along your journey.
                </p>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View Progress →
                </button>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mt-8 p-6 rounded-xl border border-border/40 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-foreground/90 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 rounded-md border border-border bg-white/70 text-sm text-foreground/70 hover:bg-white shadow-sm"
                >
                  Update Profile
                </button>
                <button className="px-4 py-2 rounded-md border border-border bg-white/70 text-sm text-foreground/70 hover:bg-white shadow-sm">
                  Set Goals
                </button>
                <button className="px-4 py-2 rounded-md border border-border bg-white/70 text-sm text-foreground/70 hover:bg-white shadow-sm">
                  Track Progress
                </button>
                <button className="px-4 py-2 rounded-md border border-border bg-white/70 text-sm text-foreground/70 hover:bg-white shadow-sm">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBlueprint;

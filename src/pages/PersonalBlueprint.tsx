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
        <div className="mx-auto max-w-6xl flex">
          {/* Left sidebar - Timeline */}
          <div className="w-24 flex flex-col items-center pr-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-xs text-gray-500">Now</div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="text-4xl font-bold text-gray-800">26</div>
              <div className="text-xs text-gray-500">Today</div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Main content area - Scrollable roadmap */}
          <div className="flex-1 overflow-y-auto max-h-screen">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground/90 mb-2">Personal Blueprint</h1>
                <p className="text-foreground/70 text-sm">
                  Your personalized roadmap to academic and career success.
                </p>
              </div>

              {/* Loading state */}
              <div className="text-sm text-gray-500 mb-4">Fetching the data...</div>

              {/* Roadmap Cards */}
              <div className="space-y-4">
                {/* James Wood Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">James Wood</h3>
                        <p className="text-sm text-gray-600">Senior ML Engineer</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">JW</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-blue-600">Accomplishment</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                      </div>
                      <p className="text-sm text-gray-700">Implemented core feedback system with data models and services.</p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                      </div>
                      <p className="text-sm text-gray-700">Successfully launched a new product line ahead of schedule</p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      </div>
                      <p className="text-sm text-gray-700">Implemented a cost-saving strategy that reduced expenses by 15%</p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                      </div>
                      <p className="text-sm text-gray-700">Developed an innovative training program that improved team efficiency by 20%</p>
                    </div>
                  </div>
                </div>

                {/* Kate Happkins Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Kate Happkins</h3>
                        <p className="text-sm text-gray-600">Intern ML Engineer</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">KH</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-green-600">Goal & Achievement</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        </div>
                        <p className="text-sm text-gray-700">Implemented core feedback system with data models and services.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">74%</span>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        </div>
                        <p className="text-sm text-gray-700">Developed an innovative training program that improved team efficiency by 20%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">0%</span>
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        </div>
                        <p className="text-sm text-gray-700">Developed an innovative training program that improved team efficiency by 20%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">34%</span>
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ian McGuigan Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Ian McGuigan</h3>
                        <p className="text-sm text-gray-600">Product Owner</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">IM</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-purple-600">Feedback Received</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">2 days ago via Windmill</span>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white animate-spin" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        "Working with Max is great. He is very talented developer. We just completed a sprint and he has been working hard on his tasks to achieve the deadline. Thank you James!"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">BJ</span>
                        </div>
                        <span className="text-sm text-gray-600">Benjamin Jackson</span>
                      </div>
                    </div>
                  </div>
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

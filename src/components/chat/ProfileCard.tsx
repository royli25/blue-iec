import { User, ExternalLink } from "lucide-react";

interface ChatProfileCardProps {
  name: string;
  gpa?: string;
  testScore?: string;
  results?: string;
  profileUrl?: string;
}

export function ChatProfileCard({ 
  name, 
  gpa, 
  testScore, 
  results, 
  profileUrl 
}: ChatProfileCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-[15px] text-gray-900 leading-tight">
              {name}
            </h4>
            <div className="space-y-0.5 mt-1">
              {gpa && (
                <div className="text-[13px] text-gray-600">
                  <span className="font-medium">GPA:</span> {gpa}
                </div>
              )}
              {testScore && (
                <div className="text-[13px] text-gray-600">
                  <span className="font-medium">Test Score:</span> {testScore}
                </div>
              )}
              {results && (
                <div className="text-[13px]">
                  <span className="font-medium text-gray-600">Results:</span> 
                  <span className={`ml-1 font-medium ${
                    results.toLowerCase().includes('accepted') ? 'text-green-600' :
                    results.toLowerCase().includes('rejected') ? 'text-red-600' :
                    results.toLowerCase().includes('waitlisted') ? 'text-orange-600' :
                    'text-gray-700'
                  }`}>
                    {results}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {profileUrl && (
          <a 
            href={profileUrl}
            className="shrink-0 p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            title="View full profile"
          >
            <ExternalLink className="h-4 w-4 text-gray-600" />
          </a>
        )}
      </div>
    </div>
  );
}






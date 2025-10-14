import { GraduationCap, Trophy, CheckCircle, Clock, XCircle } from "lucide-react";

interface StudentCardProps {
  name: string;
  gpa: string;
  testScore: string;
  result: string;
  profileUrl?: string;
}

export function StudentCard({ name, gpa, testScore, result, profileUrl }: StudentCardProps) {
  // Parse GPA for visualization (assuming format like "4.47 (weighted)" or "3.7 UW / 4.0 W")
  const parseGPA = (gpaStr: string): number => {
    const match = gpaStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Parse test score for visualization
  const parseTestScore = (scoreStr: string): { score: number; type: 'SAT' | 'ACT'; max: number } => {
    if (scoreStr.includes('SAT')) {
      const match = scoreStr.match(/(\d+)/);
      return { score: match ? parseInt(match[1]) : 0, type: 'SAT', max: 1600 };
    } else if (scoreStr.includes('ACT')) {
      const match = scoreStr.match(/(\d+)/);
      return { score: match ? parseInt(match[1]) : 0, type: 'ACT', max: 36 };
    }
    return { score: 0, type: 'SAT', max: 1600 };
  };

  // Determine result type and color
  const getResultStyle = (resultStr: string) => {
    const lowerResult = resultStr.toLowerCase();
    if (lowerResult.includes('accepted') || lowerResult.includes('admitted')) {
      return {
        icon: CheckCircle,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Accepted',
      };
    } else if (lowerResult.includes('waitlist')) {
      return {
        icon: Clock,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Waitlisted',
      };
    } else if (lowerResult.includes('rejected') || lowerResult.includes('denied')) {
      return {
        icon: XCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Rejected',
      };
    }
    return {
      icon: CheckCircle,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Unknown',
    };
  };

  const gpaValue = parseGPA(gpa);
  const gpaPercentage = Math.min((gpaValue / 4.5) * 100, 100);
  
  const testScoreData = parseTestScore(testScore);
  const testScorePercentage = (testScoreData.score / testScoreData.max) * 100;
  
  const resultStyle = getResultStyle(result);
  const ResultIcon = resultStyle.icon;

  return (
    <div className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with name and result */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex-1 min-w-0">
          {profileUrl ? (
            <a
              href={profileUrl}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block truncate"
            >
              {name}
            </a>
          ) : (
            <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${resultStyle.bgColor} ${resultStyle.borderColor} border shrink-0`}>
          <ResultIcon className={`h-3.5 w-3.5 ${resultStyle.color}`} />
          <span className={`text-xs font-semibold ${resultStyle.color}`}>
            {resultStyle.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 space-y-3">
        {/* GPA */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">GPA</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{gpa}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${gpaPercentage}%` }}
            />
          </div>
        </div>

        {/* Test Score */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Test Score</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{testScore}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${testScorePercentage}%` }}
            />
          </div>
        </div>

        {/* Result details */}
        <div className="pt-1">
          <p className="text-xs text-gray-600 leading-relaxed">
            {result}
          </p>
        </div>
      </div>
    </div>
  );
}


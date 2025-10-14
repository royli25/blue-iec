import { StudentCard } from "@/components/chat/StudentCard";

interface StudentProfile {
  name: string;
  gpa: string;
  testScore: string;
  result: string;
  profileUrl?: string;
}

/**
 * Parses markdown text to extract student profiles
 * Detects patterns like:
 * 
 * 1. **Maya Singh**
 *    - GPA: 4.47 (weighted)
 *    - Test Score: 1530 SAT
 *    - Result: Accepted to USC
 */
export function parseStudentProfiles(markdown: string): {
  hasProfiles: boolean;
  profiles: StudentProfile[];
  remainingContent: string;
} {
  const profiles: StudentProfile[] = [];
  
  // Pattern to match student profile sections
  // Matches: numbered list item with name, followed by GPA, Test Score, and Result
  const profilePattern = /\d+\.\s+\*\*([^*]+)\*\*\s*\n\s*[-•]\s*\*\*GPA:\*\*\s*([^\n]+)\n\s*[-•]\s*\*\*Test Score:\*\*\s*([^\n]+)\n\s*[-•]\s*\*\*Result:\*\*\s*([^\n]+)/gi;
  
  let match;
  let lastIndex = 0;
  const segments: string[] = [];
  
  while ((match = profilePattern.exec(markdown)) !== null) {
    // Add content before this match
    if (match.index > lastIndex) {
      segments.push(markdown.slice(lastIndex, match.index));
    }
    
    // Extract student data
    const [, name, gpa, testScore, result] = match;
    
    // Check if name contains a link pattern [Name](url)
    const linkMatch = name.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const profileUrl = linkMatch ? linkMatch[2] : undefined;
    const cleanName = linkMatch ? linkMatch[1] : name.trim();
    
    profiles.push({
      name: cleanName,
      gpa: gpa.trim(),
      testScore: testScore.trim(),
      result: result.trim(),
      profileUrl,
    });
    
    // Add a placeholder that we'll replace with the React component
    segments.push(`__STUDENT_CARD_${profiles.length - 1}__`);
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining content
  if (lastIndex < markdown.length) {
    segments.push(markdown.slice(lastIndex));
  }
  
  return {
    hasProfiles: profiles.length > 0,
    profiles,
    remainingContent: segments.join(''),
  };
}

/**
 * Renders content with student cards
 */
export function renderWithStudentCards(
  markdown: string,
  onProfileLinkClick?: (href: string) => void
): { content: JSX.Element; hasCards: boolean } {
  const { hasProfiles, profiles, remainingContent } = parseStudentProfiles(markdown);
  
  if (!hasProfiles) {
    return {
      content: <div dangerouslySetInnerHTML={{ __html: markdown }} />,
      hasCards: false,
    };
  }
  
  // Split content by card placeholders
  const parts = remainingContent.split(/__STUDENT_CARD_(\d+)__/);
  
  return {
    content: (
      <div className="space-y-3">
        {parts.map((part, index) => {
          // Even indices are text content
          if (index % 2 === 0) {
            if (part.trim()) {
              return (
                <div
                  key={`text-${index}`}
                  dangerouslySetInnerHTML={{ __html: part }}
                  onClick={(e) => {
                    if (onProfileLinkClick) {
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'A' && target.classList.contains('profile-link')) {
                        e.preventDefault();
                        const href = target.getAttribute('href');
                        if (href) onProfileLinkClick(href);
                      }
                    }
                  }}
                />
              );
            }
            return null;
          }
          
          // Odd indices are card indices
          const cardIndex = parseInt(part);
          const profile = profiles[cardIndex];
          
          if (!profile) return null;
          
          return (
            <StudentCard
              key={`card-${index}`}
              name={profile.name}
              gpa={profile.gpa}
              testScore={profile.testScore}
              result={profile.result}
              profileUrl={profile.profileUrl}
            />
          );
        })}
      </div>
    ),
    hasCards: true,
  };
}


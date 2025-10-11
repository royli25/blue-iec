import type { KbMatch } from "@/integrations/supabase/search";
import type { StudentProfile, StudentMetadata } from "@/types/profile";

/**
 * Transform a KB match into a formatted student profile for display
 */
export function formatStudentProfile(profile: KbMatch): StudentProfile {
  const meta = profile.metadata || {};
  
  // Extract school info - get the first decision if available
  const decisionsText = meta.decisions_compact || '';
  const firstAcceptance = decisionsText
    .split('|')
    .find((d: string) => d.includes('Accepted'))
    ?.split('[')[0]
    ?.trim();
  
  const school = firstAcceptance || 'Various Universities';
  const major = meta.intended_major || 'Undecided';
  
  return {
    name: meta.name || 'Student',
    role: `${school} '28 — ${major}`,
    blurb: meta.narrative_summary || profile.body.substring(0, 200) + '...',
    metadata: meta as StudentMetadata,
  };
}

/**
 * Format a list of activities for display
 */
export function formatActivities(activities: Array<{name: string, description: string}>): string {
  return activities
    .filter(a => a.name || a.description)
    .map(a => `${a.name}${a.description ? ` - ${a.description}` : ''}`)
    .join('; ');
}

/**
 * Format AP exam scores for display
 */
export function formatAPExams(exams: Array<{exam: string, score: string}>): string {
  return exams
    .filter(e => e.exam || e.score)
    .map(e => `${e.exam}${e.score ? ` - ${e.score}` : ''}`)
    .join('; ');
}

/**
 * Format awards for display
 */
export function formatAwards(awards: Array<{name: string, level: string}>): string {
  return awards
    .filter(a => a.name || a.level)
    .map(a => `${a.name}${a.level ? ` (${a.level})` : ''}`)
    .join('; ');
}

/**
 * Get the color variant for a decision status
 */
export function getDecisionColor(decision: string): {bg: string, border: string} {
  if (decision.includes('Accepted')) {
    return { bg: 'bg-green-50', border: 'border-green-200' };
  }
  if (decision.includes('Rejected')) {
    return { bg: 'bg-red-50', border: 'border-red-200' };
  }
  return { bg: 'bg-orange-50', border: 'border-orange-200' };
}


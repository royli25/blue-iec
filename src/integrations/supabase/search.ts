import { supabase } from '@/integrations/supabase/client';

async function embedQuery(query: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data[0].embedding as number[];
}

export type KbMatch = {
  id: string;
  kind: string;
  title: string | null;
  body: string;
  metadata: any;
  similarity: number;
};

export async function matchKb(query: string, filter: Record<string, any> = {}, k = 5): Promise<KbMatch[]> {
  const embedding = await embedQuery(query);
  // Cast to any to avoid strict typing on generated types (function not in local types)
  const { data, error } = await (supabase as any).rpc('match_kb_chunks', {
    query_embedding: embedding,
    match_count: k,
    filter,
  });
  if (error) throw error;
  return data as KbMatch[];
}

export type KbContextOptions = {
  k?: number;
  maxCharsPerChunk?: number;
  maxTotalChars?: number;
  header?: string;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function formatOne(match: KbMatch, index: number, maxCharsPerChunk: number, includeMetadata: boolean): string {
  const title = match.title || truncate(match.body, 80);
  const snippet = truncate(match.body.replace(/\s+/g, ' ').trim(), maxCharsPerChunk);
  const lines: string[] = [];
  lines.push(`[KB ${index}] ${title}`);
  lines.push(snippet);
  if (includeMetadata) {
    const url = match.metadata?.url || match.metadata?.source || '';
    if (url) lines.push(`Source: ${url}`);
  }
  return lines.join('\n');
}

export async function buildKbContextBlock(
  query: string,
  options: KbContextOptions = {}
): Promise<{ block: string; matches: KbMatch[] }> {
  const {
    k = 5,
    maxCharsPerChunk = 500,
    maxTotalChars = 1800,
    header = 'KB Context',
    includeMetadata = true,
    filter = {},
  } = options;

  let matches: KbMatch[] = [];
  try {
    matches = await matchKb(query, filter, k);
  } catch {
    return { block: '', matches: [] };
  }

  const parts: string[] = [];
  parts.push(header);
  let total = 0;
  for (let i = 0; i < matches.length; i++) {
    const formatted = formatOne(matches[i], i + 1, maxCharsPerChunk, includeMetadata);
    if (total + formatted.length > maxTotalChars) break;
    parts.push(formatted);
    parts.push('---');
    total += formatted.length;
  }

  // Remove trailing separator
  if (parts[parts.length - 1] === '---') parts.pop();

  const block = parts.join('\n');
  return { block, matches };
}

/**
 * Build a natural language query from user profile to find similar students
 */
export function buildProfileSearchQuery(profileData: {
  gradeLevel?: string;
  demographic?: string;
  school?: string;
  gpa?: string;
  sat?: string;
  activities?: { name: string; description: string }[];
  apExams?: { exam: string; score: string }[];
  awards?: { name: string; level: string }[];
}): string {
  const parts: string[] = [];
  
  // Extract major/interests from activities
  const activities = profileData.activities?.filter(a => a.name || a.description) || [];
  const activityDescriptions = activities.map(a => `${a.name} ${a.description}`.trim()).join(', ');
  
  // Build a natural description
  if (profileData.gpa) {
    parts.push(`Student with GPA ${profileData.gpa}`);
  }
  
  if (profileData.sat) {
    parts.push(`SAT score ${profileData.sat}`);
  }
  
  if (activityDescriptions) {
    parts.push(`Interested in and involved with: ${activityDescriptions}`);
  }
  
  const awards = profileData.awards?.filter(a => a.name) || [];
  if (awards.length > 0) {
    const awardsList = awards.map(a => a.name).join(', ');
    parts.push(`Awards: ${awardsList}`);
  }
  
  const apExams = profileData.apExams?.filter(e => e.exam) || [];
  if (apExams.length > 0) {
    const examsList = apExams.map(e => e.exam).join(', ');
    parts.push(`AP courses: ${examsList}`);
  }
  
  return parts.join('. ');
}

/**
 * Format student profile matches into a context block
 */
function formatStudentProfile(match: KbMatch, index: number): string {
  const meta = match.metadata || {};
  const lines: string[] = [];
  
  lines.push(`[Student Profile ${index}]`);
  
  if (meta.name) lines.push(`Name: ${meta.name}`);
  if (meta.intended_major) lines.push(`Intended Major: ${meta.intended_major}`);
  if (meta.gpa_weighted) lines.push(`GPA: ${meta.gpa_weighted} (weighted)`);
  if (meta.test_score && meta.test_type) lines.push(`Test Score: ${meta.test_score} ${meta.test_type}`);
  if (meta.high_school_location) lines.push(`Location: ${meta.high_school_location}, ${meta.country || ''}`);
  if (meta.hook_context) lines.push(`Hook: ${meta.hook_context}`);
  if (meta.accept_count !== undefined) lines.push(`Results: ${meta.accept_count} accepted, ${meta.reject_count || 0} rejected`);
  
  // CRITICAL: Include FULL decisions data - do NOT truncate this as it contains acceptance/rejection information
  if (meta.decisions_compact) {
    lines.push(`\nCollege Decisions (COMPLETE LIST):\n${meta.decisions_compact}`);
  }
  
  // Include other profile information (can be truncated)
  const bodySnippet = truncate(match.body.replace(/\s+/g, ' ').trim(), 600);
  lines.push(`\nProfile Summary:\n${bodySnippet}`);
  
  return lines.join('\n');
}

/**
 * Build a context block with similar student profiles
 */
export async function buildSimilarProfilesBlock(
  profileData: any,
  options: { k?: number; maxTotalChars?: number } = {}
): Promise<{ block: string; matches: KbMatch[] }> {
  const { k = 3, maxTotalChars = 2000 } = options;
  
  // Build search query from user profile
  const searchQuery = buildProfileSearchQuery(profileData);
  
  if (!searchQuery.trim()) {
    return { block: '', matches: [] };
  }
  
  let matches: KbMatch[] = [];
  try {
    // Search for student profiles specifically
    matches = await matchKb(searchQuery, { kind: 'student_profile' }, k);
  } catch (error) {
    console.error('Error fetching similar profiles:', error);
    return { block: '', matches: [] };
  }
  
  if (matches.length === 0) {
    return { block: '', matches: [] };
  }
  
  const parts: string[] = [];
  parts.push('Similar Student Profiles');
  parts.push('These are profiles of students with similar backgrounds and interests:');
  parts.push('');
  
  let total = 0;
  for (let i = 0; i < matches.length; i++) {
    const formatted = formatStudentProfile(matches[i], i + 1);
    if (total + formatted.length > maxTotalChars) break;
    parts.push(formatted);
    parts.push('---');
    total += formatted.length;
  }
  
  // Remove trailing separator
  if (parts[parts.length - 1] === '---') parts.pop();
  
  const block = parts.join('\n');
  return { block, matches };
}

/**
 * Fetch all student profiles from kb_chunks
 */
export async function fetchAllStudentProfiles(): Promise<KbMatch[]> {
  // Cast to any to avoid strict typing on generated types (kb_chunks not in local types)
  const { data, error } = await (supabase as any)
    .from('kb_chunks')
    .select('id, kind, title, body, metadata')
    .eq('kind', 'student_profile')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching student profiles:', error);
    return [];
  }
  
  // Format to match KbMatch type
  return (data || []).map((row: any) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    metadata: row.metadata,
    similarity: 1, // Not applicable for direct fetch
  }));
}

/**
 * Map of school name variations and abbreviations
 * Each school maps to an array of possible names/abbreviations
 */
const SCHOOL_NAME_VARIATIONS: Record<string, string[]> = {
  'MIT': ['MIT', 'Massachusetts Institute of Technology', 'M.I.T.'],
  'USC': ['USC', 'University of Southern California', 'U.S.C.'],
  'UCLA': ['UCLA', 'University of California, Los Angeles', 'UC Los Angeles', 'U.C.L.A.'],
  'UC Berkeley': ['UC Berkeley', 'University of California, Berkeley', 'Berkeley', 'UCB', 'Cal'],
  'Stanford': ['Stanford', 'Stanford University'],
  'Harvard': ['Harvard', 'Harvard University'],
  'Yale': ['Yale', 'Yale University'],
  'Princeton': ['Princeton', 'Princeton University'],
  'Columbia': ['Columbia', 'Columbia University'],
  'UPenn': ['UPenn', 'University of Pennsylvania', 'Penn', 'U Penn'],
  'Cornell': ['Cornell', 'Cornell University'],
  'Brown': ['Brown', 'Brown University'],
  'Dartmouth': ['Dartmouth', 'Dartmouth College'],
  'Caltech': ['Caltech', 'California Institute of Technology', 'CIT'],
  'Northwestern': ['Northwestern', 'Northwestern University'],
  'Duke': ['Duke', 'Duke University'],
  'Johns Hopkins': ['Johns Hopkins', 'Johns Hopkins University', 'JHU'],
  'UChicago': ['UChicago', 'University of Chicago', 'Chicago'],
  'NYU': ['NYU', 'New York University', 'N.Y.U.'],
  'Carnegie Mellon': ['Carnegie Mellon', 'Carnegie Mellon University', 'CMU'],
};

/**
 * Get all possible variations for a school name
 */
function getSchoolVariations(schoolName: string): string[] {
  const normalized = schoolName.trim();
  
  // Check if this exact name is a key in our variations map
  for (const [key, variations] of Object.entries(SCHOOL_NAME_VARIATIONS)) {
    if (variations.some(v => v.toLowerCase() === normalized.toLowerCase())) {
      return variations;
    }
  }
  
  // If no match found, return the original name
  return [normalized];
}

/**
 * Search for students who applied to specific schools
 * This uses text search in the body field to find mentions of school names
 * Handles common abbreviations and variations (MIT ↔ Massachusetts Institute of Technology)
 */
export async function fetchStudentsBySchool(
  schoolNames: string[],
  options: { k?: number; maxTotalChars?: number } = {}
): Promise<{ block: string; matches: KbMatch[] }> {
  const { k = 10, maxTotalChars = 4000 } = options;

  if (schoolNames.length === 0) {
    return { block: '', matches: [] };
  }

  try {
    // Fetch all student profiles
    const allProfiles = await fetchAllStudentProfiles();
    
    // Get all variations for each school name
    const allVariations = schoolNames.flatMap(school => getSchoolVariations(school));
    
    // Filter profiles that mention any variation of the school names
    const matchingProfiles = allProfiles.filter(profile => {
      const bodyLower = profile.body.toLowerCase();
      return allVariations.some(variation => 
        bodyLower.includes(variation.toLowerCase())
      );
    });

    // Limit to k profiles
    const limitedProfiles = matchingProfiles.slice(0, k);

    if (limitedProfiles.length === 0) {
      return { block: '', matches: [] };
    }

    // Build the context block
    const parts: string[] = [];
    parts.push(`Student Profiles - Applied to ${schoolNames.join(', ')}`);
    parts.push(`These are profiles of students who applied to the mentioned school(s):`);
    parts.push('');

    let total = 0;
    for (let i = 0; i < limitedProfiles.length; i++) {
      const formatted = formatStudentProfile(limitedProfiles[i], i + 1);
      if (total + formatted.length > maxTotalChars) break;
      parts.push(formatted);
      parts.push('---');
      total += formatted.length;
    }

    // Remove trailing separator
    if (parts[parts.length - 1] === '---') parts.pop();

    const block = parts.join('\n');
    return { block, matches: limitedProfiles };
  } catch (error) {
    console.error('Error fetching students by school:', error);
    return { block: '', matches: [] };
  }
}




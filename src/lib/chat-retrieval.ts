import { extractSchoolNames } from "@/integrations/openai/client";
import { 
  buildKbContextBlock, 
  buildSimilarProfilesBlock, 
  fetchStudentsBySchool 
} from "@/integrations/supabase/search";
import { CHAT_CONFIG } from "./chat-constants";
import type { ProfileData } from "@/hooks/useProfileContext";

/**
 * Result from context retrieval
 */
export interface RetrievalResult {
  studentProfilesBlock: string;
  kbBlock: string;
  schoolNames: string[];
}

/**
 * Retrieves student profiles and knowledge base context for a chat query
 * 
 * Strategy:
 * 1. Extract school names from query using AI
 * 2. If schools mentioned → fetch students who applied to those schools
 *    Else if user has profile → fetch similar student profiles
 * 3. Always fetch relevant knowledge base content
 */
export async function retrieveChatContext(
  query: string,
  profileData: ProfileData | null
): Promise<RetrievalResult> {
  // STEP 1: Extract school names from the query using AI
  let schoolNames: string[] = [];
  try {
    schoolNames = await extractSchoolNames(query);
  } catch (error) {
    console.error('Error extracting school names:', error);
  }

  // STEP 2: Choose retrieval strategy based on whether schools were mentioned
  let studentProfilesBlock = '';
  if (schoolNames.length > 0) {
    // If schools are mentioned, fetch students who applied to those schools
    const { block } = await fetchStudentsBySchool(schoolNames, { 
      k: CHAT_CONFIG.retrievalLimits.studentProfiles, 
      maxTotalChars: CHAT_CONFIG.retrievalLimits.maxTotalChars 
    });
    studentProfilesBlock = block;
  } else if (profileData) {
    // Otherwise, fetch similar profiles based on the user's profile
    const { block } = await buildSimilarProfilesBlock(profileData, { 
      k: CHAT_CONFIG.retrievalLimits.similarProfiles, 
      maxTotalChars: CHAT_CONFIG.retrievalLimits.maxTotalChars 
    });
    studentProfilesBlock = block;
  }

  // STEP 3: Fetch knowledge base context
  const { block: kbBlock } = await buildKbContextBlock(query, { 
    k: CHAT_CONFIG.retrievalLimits.knowledgeBase, 
    maxCharsPerChunk: CHAT_CONFIG.retrievalLimits.maxCharsPerChunk, 
    maxTotalChars: CHAT_CONFIG.retrievalLimits.kbMaxTotalChars, 
    header: 'KB Context', 
    includeMetadata: true 
  });

  return {
    studentProfilesBlock,
    kbBlock,
    schoolNames,
  };
}

/**
 * Builds the enhanced system prompt with retrieved context
 */
export function buildSystemPromptWithContext(
  basePrompt: string,
  studentProfilesBlock: string,
  kbBlock: string,
  schoolNames: string[],
  language: 'en' | 'zh' = 'en'
): string {
  let systemWithContext = basePrompt;

  // Add language instruction
  if (language === 'zh') {
    systemWithContext += `\n\n---\nIMPORTANT: Respond in Mandarin Chinese (简体中文). All your responses should be in Chinese. Use proper Chinese terminology for college application concepts.`;
  }

  // Add student profiles context
  if (studentProfilesBlock) {
    systemWithContext += `\n\n---\n${studentProfilesBlock}`;
  }

  // Add knowledge base context
  if (kbBlock) {
    systemWithContext += `\n\n---\n${kbBlock}`;
  }

  // Add retrieval strategy note
  if (schoolNames.length > 0) {
    const note = language === 'zh' 
      ? `\n\n---\n注意：上述学生档案是专门检索的，因为他们申请了${schoolNames.join('、')}。使用这些档案帮助用户了解他们的机会，并将他们的档案与申请这些学校的学生进行比较。`
      : `\n\n---\nNOTE: The student profiles above were specifically retrieved because they applied to ${schoolNames.join(', ')}. Use these profiles to help the user understand their chances and compare their profile to students who applied to these schools.`;
    systemWithContext += note;
  }

  return systemWithContext;
}


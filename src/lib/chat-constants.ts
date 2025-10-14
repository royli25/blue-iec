/**
 * Constants for chat UI styling and configuration
 */

export const CHAT_COLORS = {
  userMessage: '#F2DABA',
  assistantMessage: '#F1E9DA',
  assistantMessageGradient: 'linear-gradient(135deg, #F1E9DA 0%, #F5F0E8 100%)',
  background: 'hsl(45 52% 97%)',
} as const;

export const CHAT_CONFIG = {
  maxRecentChats: 10,
  placeholderRotationInterval: 3000,
  placeholderTransitionDuration: 350,
  retrievalLimits: {
    studentProfiles: 10,
    similarProfiles: 5,
    knowledgeBase: 5,
    maxTotalChars: 4000,
    maxCharsPerChunk: 500,
    kbMaxTotalChars: 1800,
  },
} as const;

export const PLACEHOLDER_PROMPTS = [
  "Help me find opportunities in the Bay Area for a Psychology major.",
  "Suggest summer research or internships for a junior into neuroscience.",
  "Find community service roles for a student passionate about climate policy.",
  "Draft a cohesive story linking robotics, entrepreneurship, and leadership.",
  "Recommend clubs and projects to build a compelling CS transfer story.",
] as const;

export const PROSE_CLASSES = 
  "prose prose-sm prose-neutral max-w-none leading-6 text-[15px] " +
  "prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 " +
  "prose-a:text-blue-700 prose-strong:font-semibold prose-h1:text-[19px] prose-h2:text-[17px] prose-h3:text-[15px]";

export const CARD_PROSE_CLASSES =
  "prose prose-sm prose-neutral max-w-none leading-snug text-[15px] " +
  "prose-headings:mt-0 prose-headings:mb-0 prose-h3:text-[17px] prose-h3:font-semibold prose-h3:text-gray-900 " +
  "prose-p:my-0.5 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 " +
  "prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:font-semibold prose-strong:text-gray-800";

export const DROPDOWN_PROSE_CLASSES =
  "prose prose-sm prose-neutral max-w-none leading-snug text-[15px] " +
  "prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 " +
  "prose-a:text-blue-600 prose-a:font-medium prose-strong:font-semibold prose-strong:text-gray-800";


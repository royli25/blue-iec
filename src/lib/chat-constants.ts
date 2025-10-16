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

export const CHINESE_PLACEHOLDER_PROMPTS = [
  "帮我为心理学专业在湾区寻找机会。",
  "为对神经科学感兴趣的大三学生推荐暑期研究或实习。",
  "为对气候政策充满热情的学生寻找社区服务角色。",
  "起草一个连接机器人技术、创业和领导力的连贯故事。",
  "推荐俱乐部和项目来构建引人注目的计算机科学转学故事。",
] as const;

export const PROSE_CLASSES = 
  "prose prose-neutral max-w-none text-[15px] leading-relaxed " +
  // Headings - Clear hierarchy with bigger differences
  "prose-headings:font-bold prose-headings:tracking-tight " +
  "prose-h1:text-[23px] prose-h1:leading-tight prose-h1:mt-0 prose-h1:mb-2 prose-h1:text-gray-950 " +
  "prose-h2:text-[18px] prose-h2:leading-snug prose-h2:mt-2.5 prose-h2:mb-0.5 prose-h2:text-gray-800 " +
  "prose-h3:text-[16px] prose-h3:leading-snug prose-h3:mt-2 prose-h3:mb-0.5 prose-h3:text-gray-700 " +
  // Paragraphs and lists - more compact, tighter to headings
  "prose-p:my-1 prose-p:leading-relaxed prose-p:text-gray-600 " +
  "prose-ul:my-0.5 prose-ul:space-y-0.5 " +
  "prose-ol:my-0.5 prose-ol:space-y-0.5 " +
  "prose-li:my-0 prose-li:text-gray-600 " +
  // Links and emphasis
  "prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700 " +
  "prose-strong:font-semibold prose-strong:text-gray-900";

export const CARD_PROSE_CLASSES =
  "prose prose-neutral max-w-none text-[15px] leading-snug " +
  // Card headings - Compact with strong hierarchy
  "prose-headings:font-bold prose-headings:tracking-tight " +
  "prose-h1:text-[20px] prose-h1:mt-0 prose-h1:mb-1 prose-h1:text-gray-950 " +
  "prose-h2:text-[17px] prose-h2:mt-0 prose-h2:mb-0.5 prose-h2:text-gray-800 " +
  "prose-h3:text-[16px] prose-h3:mt-0 prose-h3:mb-0.5 prose-h3:text-gray-700 " +
  // Very compact spacing for cards
  "prose-p:my-0.5 prose-p:text-gray-600 " +
  "prose-ul:my-0.5 prose-ul:space-y-0 " +
  "prose-ol:my-0.5 prose-ol:space-y-0 " +
  "prose-li:my-0 prose-li:text-gray-600 " +
  // Links and emphasis
  "prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700 " +
  "prose-strong:font-semibold prose-strong:text-gray-900";

export const DROPDOWN_PROSE_CLASSES =
  "prose prose-neutral max-w-none text-[15px] leading-relaxed " +
  // Dropdown headings - compact but readable
  "prose-headings:font-semibold prose-headings:tracking-tight " +
  "prose-h1:text-[18px] prose-h1:mt-0 prose-h1:mb-1 prose-h1:text-gray-900 " +
  "prose-h2:text-[16px] prose-h2:mt-1.5 prose-h2:mb-0.5 prose-h2:text-gray-800 " +
  "prose-h3:text-[15px] prose-h3:mt-1 prose-h3:mb-0.5 prose-h3:text-gray-700 " +
  // Compact spacing
  "prose-p:my-1 prose-p:text-gray-600 " +
  "prose-ul:my-1 prose-ul:space-y-0.5 " +
  "prose-ol:my-1 prose-ol:space-y-0.5 " +
  "prose-li:my-0 prose-li:text-gray-600 " +
  // Links and emphasis
  "prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700 " +
  "prose-strong:font-semibold prose-strong:text-gray-900";


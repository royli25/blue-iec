export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function createChatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Missing VITE_OPENAI_API_KEY. Add it to your .env file.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenAI API request failed");
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }
  return content;
}

/**
 * Extract school/university names from a user query using AI
 * Returns an array of school names mentioned in the query
 */
export async function extractSchoolNames(query: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error("Missing VITE_OPENAI_API_KEY. Add it to your .env file.");
  }

  const systemPrompt = `You are a school name extractor. Extract the names of colleges, universities, or schools mentioned in the user's query.

Rules:
1. Return ONLY the school names, one per line
2. Use the full, official name of the school (e.g., "Stanford University" not "Stanford")
3. If multiple schools are mentioned, list them all
4. If NO schools are mentioned, return "NONE"
5. Do not include any explanation or extra text

Examples:
Query: "Should I apply to Stanford?"
Output:
Stanford University

Query: "Help me build a school list"
Output:
NONE

Query: "Compare Harvard and Yale for economics"
Output:
Harvard University
Yale University

Query: "What are my chances at MIT and Caltech?"
Output:
Massachusetts Institute of Technology
California Institute of Technology`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0, // Make it deterministic
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenAI API request failed");
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content || content.trim() === "NONE") {
    return [];
  }
  
  // Parse the response - each school on a new line
  return content
    .trim()
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== "NONE");
}

/**
 * Cache for normalized school names to avoid repeated AI calls
 */
const schoolNameCache = new Map<string, string>();

/**
 * Normalize a school name to its canonical/official form using AI
 * Examples:
 * - "MIT" → "Massachusetts Institute of Technology"
 * - "USC" → "University of Southern California"
 * - "Berkeley" → "University of California, Berkeley"
 */
export async function normalizeSchoolName(schoolName: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

  if (!apiKey) {
    return schoolName; // Fallback to original
  }

  // Check cache first
  const cacheKey = schoolName.toLowerCase().trim();
  if (schoolNameCache.has(cacheKey)) {
    return schoolNameCache.get(cacheKey)!;
  }

  const systemPrompt = `You are a school name normalizer. Convert any school name or abbreviation to its full, official name.

Rules:
1. Return ONLY the official name, nothing else
2. Use the full formal name (e.g., "Massachusetts Institute of Technology" not "MIT")
3. Be consistent - same input should always give same output
4. If it's already the official name, return it unchanged
5. If you're not sure, return the input unchanged

Examples:
Input: MIT
Output: Massachusetts Institute of Technology

Input: USC
Output: University of Southern California

Input: Berkeley
Output: University of California, Berkeley

Input: Harvard
Output: Harvard University

Input: Stanford University
Output: Stanford University`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: schoolName }
        ],
        temperature: 0, // Deterministic
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      return schoolName; // Fallback
    }

    const data = await response.json();
    const normalized = data?.choices?.[0]?.message?.content?.trim();
    const result = normalized || schoolName;
    
    // Cache the result
    schoolNameCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error normalizing school name:', error);
    return schoolName; // Fallback
  }
}



import type { Operation } from "@/lib/editor-api";

export function buildSystemPrompt(): string {
  return `You are an assistant that edits a TipTap document for a high school college-planning blueprint.
Follow these rules:
1) Decide intelligently where the change belongs. Prefer section-aware edits: append under an existing heading or replace that section. ONLY use insert_at_cursor if the user explicitly says "here" or references the caret.
2) Return ONLY JSON, an array of operations, no commentary.
3) For contentMd, use simple Markdown lines only: headings with at most one level (## or ###), bullet items starting with '- ', and plain paragraphs. Do NOT include inline bold/italic markers like **text** or *text* unless explicitly requested. Do NOT include code blocks.
4) Prefer targeted edits; do not replace the entire document unless explicitly asked.
5) If the instruction is unclear, return a single {"type":"noop","reason":"..."}.
Schema examples:
[
  {"type":"append_section","heading":"Scholarships","contentMd":"- Research local scholarships\n- Track deadlines"},
  {"type":"replace_heading_section","heading":"GPA Management","contentMd":"- Use a tracker app\n- Weekly study schedule"}
]
`;
}

export function buildUserMessage(instruction: string, currentDocMarkdown: string): string {
  // Cap the document length to avoid token explosion
  const cap = 60000;
  const doc = currentDocMarkdown.length > cap ? currentDocMarkdown.slice(0, cap) + "\n... [truncated]" : currentDocMarkdown;
  // Extract existing headings to guide section placement
  const headingLines = currentDocMarkdown
    .split(/\n/)
    .filter(l => /^#{1,3}\s+/.test(l))
    .map(l => l.replace(/^#{1,3}\s+/, '').trim());
  const headingsList = headingLines.length ? headingLines.map(h => `- ${h}`).join('\n') : '(none)';
  return `User request: ${instruction}\n\nExisting section headings in the document (use these to decide placement):\n${headingsList}\n\nWhen adding a subsection under an existing section, prefer this op:\n[{"type":"append_under_heading","parent":"<parent heading>","heading":"<new subsection title>","contentMd":"- bullet one\n- bullet two"}]\n\nFallbacks:\n- Use replace_heading_section to rewrite a section.\n- Use insert_at_cursor only if the user says to insert here.\n\nCurrent document (Markdown):\n\n${doc}\n\nReturn only JSON array of operations.`;
}



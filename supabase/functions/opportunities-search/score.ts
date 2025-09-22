import type { Candidate, QueryContext, RagBundle, ScoredCandidate } from "./types";

function keywordScore(text: string | undefined, terms: string[]): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let c = 0;
  for (const t of terms) if (lower.includes(t.toLowerCase())) c++;
  return Math.min(5, c);
}

export async function scoreCandidates(cands: Candidate[], _rag: RagBundle, ctx: QueryContext): Promise<ScoredCandidate[]> {
  const terms = ["cs", "coding", "programming", "web", "data", "robotics", "stem", "tutor", ctx.field];
  return cands.map((c) => {
    const relevance = keywordScore((c.title || "") + "\n" + (c.text || ""), terms);
    const credibility = c.url?.includes('.edu') || c.url?.includes('.org') ? 4 : 2;
    const impact = keywordScore(c.text, ["hours", "mentoring", "deliverable", "project", "outcomes"]);
    const feasibility = 3; // placeholder; refine with distance/cost/deadline
    const story_fit = keywordScore(c.text, [(ctx.angle || "community service").toLowerCase()]);
    const score_total = 1.2*relevance + 1.0*credibility + 1.0*impact + 0.8*feasibility + 1.0*story_fit;
    return { ...c, relevance, credibility, impact, feasibility, story_fit, score_total } as ScoredCandidate;
  });
}



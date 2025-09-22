export type QueryContext = {
  field: string;
  location?: string;
  time_window?: string;
  angle?: string;
  prefs?: { radius_km?: number; budget?: number };
};

export type RagChunk = { id?: string; kind: string; title?: string; body: string; metadata?: any };
export type RagBundle = { rubrics: RagChunk[]; exemplars: RagChunk[]; playbook: RagChunk[]; prefs?: any };

export type Candidate = {
  url: string; domain?: string; title?: string; text?: string;
  org?: string; location?: string; remote?: boolean; deadline?: string | null; time_commitment?: string;
  cost?: string; audience?: string; application?: string; impact_signals?: string[];
};

export type ScoredCandidate = Candidate & {
  relevance: number; credibility: number; impact: number; feasibility: number; story_fit: number;
  score_total: number; why_strong?: string; watch_out?: string; confidence?: 'low'|'medium'|'high';
};

export type OpportunityCard = {
  title: string; org?: string; location?: string; remote?: boolean;
  deadline: string | null; time_commitment?: string; cost?: string; audience?: string; application?: string;
  impact_signals?: string[]; score: number; why_strong: string; watch_out: string; source: string; confidence: string;
};

export type SearchResponse = {
  query_context: QueryContext;
  rag_bundle_digest: { rubric_ids: string[]; exemplar_ids: string[]; playbook_ids: string[] };
  opportunities: OpportunityCard[];
};

export type Serve = (req: Request) => Promise<Response>;



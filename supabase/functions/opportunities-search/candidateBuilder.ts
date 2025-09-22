import type { FetchedDoc } from "./fetchFirecrawl";
import type { Candidate } from "./types";

function extractOrg(title?: string): string | undefined {
  if (!title) return undefined;
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}

export async function buildCandidates(docs: FetchedDoc[]): Promise<Candidate[]> {
  return docs.map((d) => ({
    url: d.url,
    title: d.title || undefined,
    org: extractOrg(d.title),
    text: d.text || d.html || undefined,
    // leave other fields for later parsers
  }));
}



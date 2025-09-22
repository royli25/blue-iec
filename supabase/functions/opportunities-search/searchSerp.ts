export type SerpItem = { title?: string; link: string; displayLink?: string; snippet?: string };

export async function searchSerp(queries: string[]): Promise<SerpItem[]> {
  const key = Deno.env.get('SERPAPI_KEY');
  const items: SerpItem[] = [];
  if (!key) return items;
  const seen = new Set<string>();
  for (const q of queries.slice(0, 6)) {
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&engine=google&num=10&api_key=${key}`;
      const r = await fetch(url, { method: 'GET' });
      const data = await r.json();
      const results = (data.organic_results || []) as any[];
      for (const r1 of results) {
        const link = r1.link as string;
        if (!link || seen.has(link)) continue;
        seen.add(link);
        items.push({ title: r1.title, link, displayLink: r1.displayed_link, snippet: r1.snippet });
        if (items.length >= 30) break;
      }
      if (items.length >= 30) break;
    } catch {
      // ignore
    }
  }
  return items;
}



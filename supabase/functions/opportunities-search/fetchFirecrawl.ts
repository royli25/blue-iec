import type { SerpItem } from "./searchSerp";

export type FetchedDoc = { url: string; title?: string; html?: string; text?: string };

export async function fetchFirecrawl(results: SerpItem[]): Promise<FetchedDoc[]> {
  const key = Deno.env.get('FIRECRAWL_KEY');
  const out: FetchedDoc[] = [];
  if (!key) return out;
  const concurrency = 5;
  const queue = results.slice(0, 30);
  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      try {
        const r = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify({ url: item.link, formats: ["markdown","html","raw"] }),
        });
        const data = await r.json().catch(() => ({}));
        out.push({ url: item.link, title: item.title, html: data.html, text: data.markdown || data.raw });
      } catch {
        // ignore
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }).map(() => worker()));
  return out;
}



import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface EssayItem {
  id: string;
  name: string;
  school: string;
  prompt: string;
  excerpt: string;
}

const mockEssays: EssayItem[] = [
  { id: '1', name: 'Ethan Zhang', school: 'UC Berkeley', prompt: 'Why major', excerpt: 'Growing up, I built...' },
  { id: '2', name: 'Sophia Ramirez', school: 'Boston University', prompt: 'Community', excerpt: 'On Saturdays I...' },
  { id: '3', name: 'Aiden Kim', school: 'Brown University', prompt: 'Open Curriculum', excerpt: 'I learn best when...' },
  { id: '4', name: 'Grace Nguyen', school: 'UC San Diego', prompt: 'Intellectual curiosity', excerpt: 'As a volunteer...' },
];

export default function AdmittedEssays() {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<EssayItem[]>(mockEssays);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setFiltered(mockEssays); return; }
    setFiltered(
      mockEssays.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.school.toLowerCase().includes(q) ||
        e.prompt.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q)
      )
    );
  }, [query]);

  return (
    <Layout>
      <PageContainer maxWidth="4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Admitted Essays</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search essays... (e.g., school, prompt keywords, student name)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-md"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="mt-8 text-center text-foreground/60">No essays found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((e) => (
              <div key={e.id} className="rounded-xl border border-border/70 bg-white/80 shadow-sm backdrop-blur-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-foreground/90 text-sm">{e.name}</div>
                    <div className="text-[12px] text-foreground/60">{e.school} — {e.prompt}</div>
                  </div>
                  <button className="rounded-md border border-brand bg-brand px-3 py-1 text-[12px] text-brand-foreground shadow-sm hover:opacity-95">View</button>
                </div>
                <div className="text-[12px] text-foreground/80 leading-relaxed line-clamp-3">
                  {e.excerpt}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </Layout>
  );
}



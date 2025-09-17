import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Rotating placeholder prompts focused on opportunities and stories
  const PROMPTS: string[] = [
    "Help me find opportunities in the Bay Area for a Psychology major.",
    "Suggest summer research or internships for a junior into neuroscience.",
    "Find community service roles for a student passionate about climate policy.",
    "Draft a cohesive story linking robotics, entrepreneurship, and leadership.",
    "Recommend clubs and projects to build a compelling CS transfer story.",
  ];
  const [promptIndex, setPromptIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (isFocused || query.length > 0) return; // pause rotation while typing or when text exists
    const interval = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setPhase('in');
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, query.length]);
  const rotatingPlaceholder = PROMPTS[promptIndex];
  const placeholderClass = query.length > 0 ? '' : (phase === 'in' ? 'placeholder-in' : 'placeholder-out');
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* top-right auth button / email */}
      <div className="absolute top-4 right-4 z-10 text-[12px]">
        {user ? (
          <span className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm">
            {user.email}
          </span>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white"
          >
            Log in
          </button>
        )}
      </div>
      {/* subtle warm background with grid */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* removed top-left and centered icons per request */}

      {/* centered search card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
        {/* intro copy above search */}
        <div className="mx-auto max-w-3xl mb-4" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
          <p className="text-[13px] sm:text-sm text-foreground/60 leading-relaxed text-left">
            Hi, we are a team of academic advisors in Los Angeles that built this tool to help students gain admissions to top universities. We holistically review profiles to identity application gaps, build cohesive stories, and provide strategic development roadmaps.
          </p>
        </div>
        <div className="mx-auto max-w-3xl rounded-xl border border-border/70 bg-white/80 shadow-[0_30px_60px_-20px_rgba(2,6,23,0.12),0_12px_24px_rgba(2,6,23,0.06)] backdrop-blur-md">
          <div className="relative">
            <textarea
              rows={4}
              placeholder={rotatingPlaceholder}
              className={`w-full resize-none rounded-xl bg-transparent px-5 pr-12 py-4 text-[15px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none ${placeholderClass}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button className="absolute right-3 bottom-3 h-8 w-8 flex items-center justify-center rounded-md border border-border bg-white/80 text-foreground/70">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* two wide option boxes (50% width each) */}
        <div className="mx-auto mt-3 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <button onClick={() => navigate('/profile')} className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">Provide Profile Context</button>
          <button className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">
            Understand our Technology
          </button>
        </div>
      </div>

      {/* floating chat removed per request */}
    </div>
  );
};

export default Index;

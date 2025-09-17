import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ProfileContext = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const [gradeLevel, setGradeLevel] = useState("");
  const [major, setMajor] = useState("");
  const [interests, setInterests] = useState("");
  const [targetSchools, setTargetSchools] = useState("");
  const [gpa, setGpa] = useState("");
  const [tests, setTests] = useState("");
  const [activities, setActivities] = useState("");
  const [goals, setGoals] = useState("");

  const applyProfileToQuery = () => {
    const parts: string[] = [];
    if (gradeLevel) parts.push(`Grade level: ${gradeLevel}`);
    if (major) parts.push(`Intended major: ${major}`);
    if (interests) parts.push(`Academic interests: ${interests}`);
    if (targetSchools) parts.push(`Target schools: ${targetSchools}`);
    if (gpa) parts.push(`GPA: ${gpa}`);
    if (tests) parts.push(`Tests: ${tests}`);
    if (activities) parts.push(`Activities: ${activities}`);
    if (goals) parts.push(`Goals: ${goals}`);
    const composed = `Provide profile context for college advising. ${parts.join(". ")}.
Suggest opportunities, projects, and a cohesive narrative.`;
    setQuery(composed);
  };

  useEffect(() => {
    // On first load, ensure viewport is at top
    window.scrollTo(0, 0);
  }, []);

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

      {/* content */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {/* structured inputs */}
          <div className="rounded-xl border border-border/70 bg-white/80 p-4 shadow-[0_30px_60px_-20px_rgba(2,6,23,0.12),0_12px_24px_rgba(2,6,23,0.06)] backdrop-blur-md">
            <div className="grid grid-cols-1 gap-3 text-[12px]">
              <div className="space-y-1">
                <label htmlFor="grade" className="text-foreground/80">Grade level</label>
                <input id="grade" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="junior, senior, etc." value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="major" className="text-foreground/80">Intended major</label>
                <input id="major" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="e.g., Computer Science" value={major} onChange={(e) => setMajor(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="interests" className="text-foreground/80">Academic interests</label>
                <input id="interests" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="neuroscience, robotics, policy, etc." value={interests} onChange={(e) => setInterests(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="schools" className="text-foreground/80">Target schools</label>
                <input id="schools" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="UCLA; UC Berkeley; Stanford" value={targetSchools} onChange={(e) => setTargetSchools(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="gpa" className="text-foreground/80">GPA</label>
                  <input id="gpa" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="3.8 UW / 4.2 W" value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="tests" className="text-foreground/80">Standardized tests</label>
                  <input id="tests" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="SAT/ACT/AP/IB info" value={tests} onChange={(e) => setTests(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="activities" className="text-foreground/80">Activities</label>
                <input id="activities" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="clubs, leadership, research, jobs" value={activities} onChange={(e) => setActivities(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="goals" className="text-foreground/80">Goals</label>
                <input id="goals" className="w-full rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80" placeholder="short-term outcomes to pursue" value={goals} onChange={(e) => setGoals(e.target.value)} />
              </div>
              <div className="mt-1 flex justify-end">
                <button onClick={applyProfileToQuery} className="rounded-md border border-border bg-white/70 px-4 py-1 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">Apply to Text</button>
              </div>
            </div>
          </div>

          {/* search-style text area */}
          <div className="rounded-xl border border-border/70 bg-white/80 shadow-[0_30px_60px_-20px_rgba(2,6,23,0.12),0_12px_24px_rgba(2,6,23,0.06)] backdrop-blur-md">
            <div className="relative">
              <textarea
                rows={12}
                placeholder="Your composed profile context will appear here..."
                className="w-full resize-none rounded-xl bg-transparent px-5 pr-12 py-4 text-[15px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="absolute right-3 bottom-3 h-8 w-8 flex items-center justify-center rounded-md border border-border bg-white/80 text-foreground/70">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* back button below content for mobile reach */}
        <div className="mx-auto mt-3 max-w-5xl flex justify-end">
          <button className="rounded-md border border-border bg-white/70 px-4 py-1 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileContext;



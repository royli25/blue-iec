import { useNavigate } from "react-router-dom";
import ProfileCard from "@/components/ProfileCard";

const AdmittedProfiles = () => {
  const navigate = useNavigate();

  const profiles = [
    {
      name: "Ava Thompson",
      role: "Yale '28 — Neuroscience",
      blurb:
        "Led a community brain health initiative and published a review on neuroplasticity. Built a mentorship circle for first-gen students.",
    },
    {
      name: "Noah Li",
      role: "Harvard '28 — CS + Gov",
      blurb:
        "Founded a civic tech nonprofit creating FOIA visualizations. Finalist at USACO Gold; led voter turnout analytics in local elections.",
    },
    {
      name: "Sofia Martinez",
      role: "Stanford '28 — Human Biology",
      blurb:
        "Researched maternal health outcomes, launched bilingual health-literacy workshops, and captained varsity cross country.",
    },
    {
      name: "Ethan Patel",
      role: "Princeton '28 — Physics",
      blurb:
        "Cosmic ray detector project lead; presented at SPS Zone Meeting. Tutored underserved students in math and physics.",
    },
    {
      name: "Maya Johnson",
      role: "Columbia '28 — Economics",
      blurb:
        "Founded a microgrant fund for student entrepreneurs; DECA ICDC finalist; policy intern on small-business development.",
    },
    {
      name: "Arjun Gupta",
      role: "MIT '28 — Computer Science",
      blurb:
        "Built open-source tools for robotics teams, led FRC software, and co-authored a paper on SLAM for low-cost hardware.",
    },
  ];

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* subtle warm background with grid (match Index.tsx) */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* content */}
      <div className="relative px-6 pt-12 pb-12">
        <div className="mx-auto max-w-4xl">
          {/* breadcrumb */}
          <div className="pb-3">
            <nav aria-label="Breadcrumb" className="text-[12px] text-foreground/70">
              <ol className="flex items-center gap-2">
                <li>
                  <button onClick={() => navigate('/')} className="underline underline-offset-2 hover:opacity-80">Home</button>
                </li>
                <li className="text-foreground/60">/</li>
                <li>
                  <button onClick={() => navigate('/admitted-profiles')} className="underline underline-offset-2 hover:opacity-80">Admitted Profiles</button>
                </li>
              </ol>
            </nav>
          </div>

          {/* header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Admitted Profiles</h1>
          </div>

          {/* grid of profile cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((p, idx) => (
              <ProfileCard
                key={`${p.name}-${idx}`}
                name={p.name}
                role={p.role}
                blurb={p.blurb}
                avatarUrl={p.avatarUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmittedProfiles;



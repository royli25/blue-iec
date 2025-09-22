import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const Technology = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* subtle warm background with grid */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      <div className="relative px-6 pt-12 pb-12">
        <div className="mx-auto max-w-3xl">
          {/* breadcrumb */}
          <div className="pb-3">
            <nav aria-label="Breadcrumb" className="text-[12px] text-foreground/70">
              <ol className="flex items-center gap-2">
                <li>
                  <button onClick={() => navigate('/')} className="underline underline-offset-2 hover:opacity-80">Home</button>
                </li>
                <li className="text-foreground/60">/</li>
                <li>
                  <button onClick={() => navigate('/technology')} className="underline underline-offset-2 hover:opacity-80">Technology</button>
                </li>
              </ol>
            </nav>
          </div>

          {/* content */}
          <div className="mx-auto max-w-3xl" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            <p className="text-[13px] sm:text-sm text-foreground/70 leading-relaxed mb-4">
              Our platform blends expert advising principles with modern AI to surface relevant opportunities, craft cohesive narratives, and help students plan impactful next steps.
            </p>
            <p className="text-[13px] sm:text-sm text-foreground/70 leading-relaxed mb-4">
              We aggregate high-signal programs, research experiences, service initiatives, and competitions. A lightweight reasoning layer ranks items by fit, readiness, and narrative leverage for each profile.
            </p>
            <p className="text-[13px] sm:text-sm text-foreground/70 leading-relaxed mb-4">
              The system learns from your inputs: major interests, coursework, activities, awards, and goals. With these signals, we generate tailored roadmaps with suggested projects, milestones, and outreach templates.
            </p>
            <p className="text-[13px] sm:text-sm text-foreground/70 leading-relaxed">
              We believe great outcomes come from clarity and consistency. Our goal is to reduce the search burden and give you a simple, guided way to build a compelling story over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technology;




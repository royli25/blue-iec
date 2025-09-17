import ProfileCard from "@/components/ProfileCard";

const RotatingPanel = () => {
  const profiles = [
    { name: "Alex Carter", role: "AI Researcher", blurb: "Works on LLM alignment and efficient inference." },
    { name: "Jamie Lee", role: "Product Designer", blurb: "Designing elegant interfaces with a focus on clarity." },
    { name: "Sam Patel", role: "Full‑stack Engineer", blurb: "Building robust APIs and real‑time systems." },
    { name: "Taylor Kim", role: "Data Scientist", blurb: "Time‑series forecasting and experimentation." },
    { name: "Jordan Diaz", role: "DevRel", blurb: "Helping developers succeed with great docs and demos." },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* Continuous vertical conveyor */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[92%] max-w-md">
            <div className="animate-[conveyor_16s_linear_infinite] space-y-4 will-change-transform">
              {[...profiles, ...profiles].map((p, i) => (
                <ProfileCard key={i} name={p.name} role={p.role} blurb={p.blurb} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingPanel;
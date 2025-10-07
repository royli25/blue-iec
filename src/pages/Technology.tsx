import { useNavigate } from "react-router-dom";

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
          <div className="space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Why BluePrint Is Different</h2>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-4">
                Generic AI chatbots give generic advice. They don't know what actually works for students like you. BluePrint uses <strong>real student data</strong> from admitted students to provide personalized, evidence-based guidance that reflects actual outcomes.
              </p>
            </section>

            {/* The Problem with Generic LLMs */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">The Problem with Generic LLMs</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <p className="text-foreground/80"><strong>No Real Data:</strong> ChatGPT and similar models rely on general internet content, not actual student outcomes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <p className="text-foreground/80"><strong>Generic Advice:</strong> Recommendations aren't tailored to your specific profile, background, or goals</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <p className="text-foreground/80"><strong>No Context:</strong> They can't show you what worked for students with similar stats, interests, and demographics</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <p className="text-foreground/80"><strong>Hallucinations:</strong> Often make up programs, deadlines, or requirements that don't exist</p>
                  </div>
                </div>
              </div>
            </section>

            {/* The BluePrint Advantage */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">The BluePrint Advantage</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p className="text-foreground/80"><strong>Real Student Profiles:</strong> Every recommendation is based on actual admitted students with their complete profiles, test scores, activities, and college decisions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p className="text-foreground/80"><strong>Similar Student Matching:</strong> We find students with backgrounds like yours and show you what opportunities they pursued and where they got accepted</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p className="text-foreground/80"><strong>Evidence-Based Guidance:</strong> Advice is grounded in real outcomes, not speculation or outdated internet content</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p className="text-foreground/80"><strong>Personalized Context:</strong> Your GPA, test scores, activities, and goals shape every response you receive</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">How We Use Data to Give Better Responses</h3>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-4">
                We use <strong>Retrieval-Augmented Generation (RAG)</strong> — a technique that combines AI with a real-time database of student profiles and outcomes. When you ask a question, we don't just guess. We find real examples and use them to inform our answer.
              </p>
              
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <pre className="text-foreground/80">{`
USER QUESTION: "What research opportunities match my CS background?"
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Understand Your Question                           │
│ We analyze what you're asking and what matters to you      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Find Similar Students                              │
│ Search our database for students with:                     │
│ • Similar academic backgrounds (CS major, your GPA range)  │
│ • Similar interests and activities                         │
│ • Comparable test scores and achievements                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Gather Real Data                                   │
│ Collect information about what those students did:         │
│ • Research programs they participated in                   │
│ • Where they got accepted                                  │
│ • What opportunities led to their success                  │
│ • Your own profile details                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Generate Personalized Answer                       │
│ AI creates a response based on:                            │
│ • Real student outcomes (not guesses)                      │
│ • Your specific profile and goals                          │
│ • Proven pathways that worked for similar students        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
          EVIDENCE-BASED, PERSONALIZED GUIDANCE
                `}</pre>
              </div>
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                This is why our responses feel different — they're based on what actually worked for real students, not generic internet advice.
              </p>
            </section>

            {/* Real Example */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">A Real Example</h3>
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-3">
                <p className="text-[12px] text-foreground/70 leading-relaxed mb-3">
                  Let's say you're a CS student with a 3.8 GPA and 1450 SAT who does robotics and math club. You ask: <em>"What research opportunities should I pursue?"</em>
                </p>
                <div className="space-y-3 text-[12px]">
                  <div className="pl-3 border-l-2 border-red-300">
                    <p className="text-foreground font-medium mb-1">Generic LLM Response:</p>
                    <p className="text-foreground/70 italic">"Consider applying to university research programs. Look for REUs (Research Experience for Undergraduates) in computer science. Network with professors..."</p>
                    <p className="text-red-600 text-[11px] mt-2">❌ Vague, generic, could apply to anyone</p>
                  </div>
                  
                  <div className="pl-3 border-l-2 border-green-500">
                    <p className="text-foreground font-medium mb-1">BluePrint Response:</p>
                    <p className="text-foreground/70 italic">"Students with profiles similar to yours (like Ethan Zhang with a 3.96 GPA and robotics background who got into UC Berkeley) succeeded by pursuing AI research internships at their state level and participating in competitive programming. Based on your robotics experience, I recommend looking at the NASA SEES program and local university CS labs. Ethan's pathway shows that combining research with national-level coding competitions strengthened his CS narrative significantly."</p>
                    <p className="text-green-600 text-[11px] mt-2">✓ Specific, evidence-based, shows proven pathway</p>
                  </div>
                </div>
              </div>
            </section>

            {/* What Data We Use */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">What Data Powers BluePrint</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">📊 Complete Student Profiles</h4>
                  <p className="text-[11px] text-foreground/70">GPA, test scores, coursework rigor, activities with impact levels, awards with competition scope, and demographic context</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">🎓 College Decisions</h4>
                  <p className="text-[11px] text-foreground/70">Where students got accepted, rejected, and waitlisted — showing realistic outcomes for different profile types</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">💡 Opportunity Pathways</h4>
                  <p className="text-[11px] text-foreground/70">What programs, internships, and competitions students pursued and how they contributed to admissions success</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">📝 Outcome Narratives</h4>
                  <p className="text-[11px] text-foreground/70">Analysis of why certain profiles succeeded or struggled at different schools</p>
                </div>
              </div>
            </section>

            {/* Bottom Line */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">The Bottom Line</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-[12px] text-foreground/80 leading-relaxed mb-3">
                  BluePrint doesn't replace your counselor or college advisor. Instead, it gives you instant access to data-driven insights that would normally take hours of research to find.
                </p>
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Every answer is grounded in what actually worked for real students with profiles like yours. No hallucinations. No generic advice. Just evidence-based guidance to help you make informed decisions about your college journey.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technology;




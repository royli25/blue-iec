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
              <h2 className="text-lg font-semibold text-foreground mb-3">How BluePrint Works</h2>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-4">
                BluePrint combines <strong>semantic search</strong>, <strong>vector embeddings</strong>, and <strong>large language models</strong> to provide personalized college guidance. Our system analyzes your profile, finds similar successful students, and recommends opportunities tailored to your unique background.
              </p>
            </section>

            {/* System Architecture Diagram */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">System Architecture</h3>
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <pre className="text-foreground/80">{`
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  React + TypeScript + Tailwind CSS + shadcn/ui Components      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  • Profile Management    • Chat Interface                       │
│  • Context Building      • Similar Profile Matching             │
└────────────┬──────────────────────────┬─────────────────────────┘
             │                          │
             ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│   SUPABASE BACKEND   │    │        OPENAI API                │
│  • PostgreSQL + RLS  │    │  • GPT-4o-mini (Chat)            │
│  • pgvector Extension│    │  • text-embedding-3-small        │
│  • Vector Search     │    │  • Embeddings (1536 dimensions)  │
│  • Authentication    │    └──────────────────────────────────┘
└──────────────────────┘
                `}</pre>
              </div>
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                Our frontend is built with modern React and TypeScript, communicating with Supabase for data storage and OpenAI for AI-powered features.
              </p>
            </section>

            {/* RAG System Explanation */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">RAG-Powered Recommendations</h3>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-4">
                We use <strong>Retrieval-Augmented Generation (RAG)</strong> to provide contextual, accurate responses. Instead of relying solely on the AI's training data, we retrieve relevant information from our knowledge base in real-time.
              </p>
              
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <pre className="text-foreground/80">{`
USER QUESTION: "What research opportunities match my CS background?"
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Convert Question to Vector Embedding               │
│ OpenAI API: text-embedding-3-small → [1536 numbers]        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Semantic Search in Knowledge Base                  │
│ • Query kb_chunks table with pgvector                      │
│ • Find top 3-5 most similar content pieces                 │
│ • Include: student profiles, opportunities, guidance       │
│ • Cosine similarity: 1 - (embedding <=> query_embedding)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Build Context Block                                │
│ • Similar student profiles with CS backgrounds             │
│ • Relevant research opportunities                          │
│ • Your profile data (GPA, activities, awards)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Generate Response with GPT-4o-mini                 │
│ System Prompt + Context + User Question → Answer           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    PERSONALIZED
                    RECOMMENDATION
                `}</pre>
              </div>
            </section>

            {/* Vector Embeddings */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Vector Embeddings & Semantic Search</h3>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-3">
                Traditional keyword search fails to understand <em>meaning</em>. Vector embeddings convert text into mathematical representations that capture semantic similarity.
              </p>
              
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4">
                <div className="text-[12px] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-foreground/60 font-mono">→</span>
                    <div>
                      <p className="text-foreground font-medium">Example Query:</p>
                      <p className="text-foreground/70">"Student interested in AI research with strong math background"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-foreground/60 font-mono">→</span>
                    <div>
                      <p className="text-foreground font-medium">Gets Converted To:</p>
                      <p className="text-foreground/70 font-mono text-[10px]">[0.023, -0.891, 0.445, ..., 0.112] (1536 numbers)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-foreground/60 font-mono">→</span>
                    <div>
                      <p className="text-foreground font-medium">Finds Similar Profiles:</p>
                      <p className="text-foreground/70">"CS major with math olympiad background" - 94% match</p>
                      <p className="text-foreground/70">"Data science student with research experience" - 87% match</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-foreground/70 leading-relaxed">
                Our system uses <strong>pgvector</strong> in PostgreSQL to perform ultra-fast cosine similarity searches across thousands of student profiles and opportunities in milliseconds.
              </p>
            </section>

            {/* Student Profile Matching */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Intelligent Profile Matching</h3>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-3">
                When you enter your profile information, we find students with similar backgrounds, interests, and achievements to show you realistic outcomes and opportunities.
              </p>
              
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <pre className="text-foreground/80">{`
YOUR PROFILE                      MATCHING ALGORITHM
┌──────────────────┐             ┌────────────────────────────┐
│ • GPA: 3.8       │             │ 1. Convert profile to      │
│ • SAT: 1450      │────────────▶│    natural language query  │
│ • Major: CS      │             │                            │
│ • Activities:    │             │ 2. Generate embedding      │
│   - Robotics     │             │                            │
│   - Math club    │             │ 3. Search kb_chunks where  │
│ • Awards:        │             │    kind='student_profile'  │
│   - State math   │             │                            │
└──────────────────┘             │ 4. Return top 3-5 matches  │
                                 │    sorted by similarity    │
                                 └────────────┬───────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────────┐
                                 │   SIMILAR STUDENTS FOUND   │
                                 │ • Ethan Zhang (UC Berkeley)│
                                 │   GPA: 3.96, SAT: 1560     │
                                 │   Similar: CS + Robotics   │
                                 │                            │
                                 │ • Noah Smith (Georgia Tech)│
                                 │   GPA: 3.89, SAT: 1510     │
                                 │   Similar: Engineering +   │
                                 │   Math competitions        │
                                 └────────────────────────────┘
                `}</pre>
              </div>
            </section>

            {/* Data Storage */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Knowledge Base Structure</h3>
              <p className="text-[12px] text-foreground/70 leading-relaxed mb-3">
                Our knowledge base stores different types of content, all searchable through vector embeddings:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">Student Profiles</h4>
                  <p className="text-[11px] text-foreground/70">20+ admitted student profiles with academics, activities, and college decisions</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">Opportunities</h4>
                  <p className="text-[11px] text-foreground/70">Internships, research programs, competitions, and service opportunities</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">Guidance Content</h4>
                  <p className="text-[11px] text-foreground/70">Expert advice, application tips, and best practices</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-1">Yale Podcast Insights</h4>
                  <p className="text-[11px] text-foreground/70">Curated admissions insights and success stories</p>
                </div>
              </div>
            </section>

            {/* Tech Stack */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Technology Stack</h3>
              <div className="space-y-3">
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-2">Frontend</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Radix UI', 'React Query', 'React Router'].map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-foreground/5 text-foreground/70 text-[11px] rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-2">Backend & Database</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Supabase', 'PostgreSQL', 'pgvector', 'Row Level Security', 'Real-time Subscriptions'].map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-foreground/5 text-foreground/70 text-[11px] rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card/50 border border-border/50 rounded-lg p-3">
                  <h4 className="text-[12px] font-semibold text-foreground mb-2">AI & Machine Learning</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['OpenAI GPT-4o-mini', 'text-embedding-3-small', 'Vector Search', 'Cosine Similarity', 'RAG Architecture'].map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-foreground/5 text-foreground/70 text-[11px] rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Why This Approach */}
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Why This Approach Works</h3>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">✓</span>
                  <p className="text-foreground/70"><strong className="text-foreground">Personalized:</strong> Every recommendation is tailored to your unique profile and goals</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">✓</span>
                  <p className="text-foreground/70"><strong className="text-foreground">Evidence-Based:</strong> Powered by real student profiles and actual admission outcomes</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">✓</span>
                  <p className="text-foreground/70"><strong className="text-foreground">Fast:</strong> Vector search returns results in milliseconds, not minutes</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">✓</span>
                  <p className="text-foreground/70"><strong className="text-foreground">Accurate:</strong> RAG ensures AI responses are grounded in real data, not hallucinations</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground/60 mt-0.5">✓</span>
                  <p className="text-foreground/70"><strong className="text-foreground">Scalable:</strong> Our architecture handles thousands of profiles and queries efficiently</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Technology;




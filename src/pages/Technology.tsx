import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, NotebookText, UsersRound, Info } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Technology = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" className="bg-[hsl(var(--sidebar-background))] border-r border-border">
        <SidebarHeader className="h-10 flex flex-row items-center justify-end px-4 py-2 group-data-[state=collapsed]:justify-center">
          <SidebarTrigger className="h-5 w-5" />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <div className="h-3" aria-hidden />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/')} tooltip="New chat" className="pr-3">
                  <MessageSquarePlus className="h-[18px] w-[18px]" />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admitted-profiles')} tooltip="Admitted Profiles" className="pr-3">
                  <UsersRound className="h-[18px] w-[18px]" />
                  <span>Admitted Profiles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/personal-blueprint')} tooltip="My Blueprint" className="pr-3">
                  <NotebookText className="h-[18px] w-[18px]" />
                  <span>My Blueprint</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/technology')} tooltip="About" className="pr-3" isActive={true}>
                  <Info className="h-[18px] w-[18px]" />
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="relative min-h-screen w-screen overflow-x-hidden">
        {/* subtle warm background with grid */}
        <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
        <div className="absolute inset-0 grid-bg opacity-70" />

      <div className="relative px-6 pt-12 pb-12">
        <div className="mx-auto max-w-3xl">
          {/* content */}
          <div className="space-y-8">
            {/* 1. RAG Retrieval */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. RAG Retrieval</h2>
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
            </section>

            {/* 2. Profile Matching */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Profile Matching</h2>
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
│   - Math club    │             │ 3. Search student_profiles │
│ • Awards:        │             │    in our database         │
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

            {/* 3. How We're Different */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. How We're Different Than Other LLMs</h2>
              
              <div className="space-y-4">
                {/* Generic LLMs */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-[13px] font-semibold text-foreground mb-2">Generic LLMs (ChatGPT, Claude, etc.)</h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✗</span>
                      <p className="text-foreground/80"><strong>No Real Data:</strong> Rely on general internet content, not actual student outcomes</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✗</span>
                      <p className="text-foreground/80"><strong>Generic Advice:</strong> Can't tailor recommendations to your specific profile</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✗</span>
                      <p className="text-foreground/80"><strong>No Similar Students:</strong> Can't show you what worked for people like you</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">✗</span>
                      <p className="text-foreground/80"><strong>Hallucinations:</strong> Often make up programs or requirements that don't exist</p>
                    </div>
                  </div>
                </div>

                {/* BluePrint */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-[13px] font-semibold text-foreground mb-2">BluePrint</h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <p className="text-foreground/80"><strong>Real Student Profiles:</strong> Every recommendation based on actual admitted students with complete data</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <p className="text-foreground/80"><strong>Similar Student Matching:</strong> Find students with your background and see where they got accepted</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <p className="text-foreground/80"><strong>Evidence-Based:</strong> Advice grounded in real outcomes, not speculation</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <p className="text-foreground/80"><strong>Personalized Context:</strong> Your GPA, test scores, and activities shape every response</p>
                    </div>
                  </div>
                </div>

                {/* Example Comparison */}
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <p className="text-[12px] font-semibold text-foreground mb-3">Example: "What research opportunities should I pursue?"</p>
                  <div className="space-y-3 text-[12px]">
                    <div className="pl-3 border-l-2 border-red-300">
                      <p className="text-foreground/70 italic">"Consider applying to university research programs. Look for REUs in computer science. Network with professors..."</p>
                      <p className="text-red-600 text-[11px] mt-1">Generic LLM: Vague, could apply to anyone</p>
                    </div>
                    
                    <div className="pl-3 border-l-2 border-green-500">
                      <p className="text-foreground/70 italic">"Students like Ethan Zhang (3.96 GPA, robotics, got into UC Berkeley) succeeded by pursuing AI research at the state level and competitive programming. Based on your profile, look at NASA SEES and local university CS labs."</p>
                      <p className="text-green-600 text-[11px] mt-1">BluePrint: Specific, evidence-based, proven pathway</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
};

export default Technology;




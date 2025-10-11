import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import { fetchAllStudentProfiles } from "@/integrations/supabase/search";
import type { KbMatch } from "@/integrations/supabase/search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const AdmittedProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      try {
        const studentProfiles = await fetchAllStudentProfiles();
        
        // Transform KB matches into profile card format
        const formattedProfiles = studentProfiles.map((profile: KbMatch) => {
          const meta = profile.metadata || {};
          
          // Extract school info - get the first decision if available
          const decisionsText = meta.decisions_compact || '';
          const firstAcceptance = decisionsText.split('|')
            .find((d: string) => d.includes('Accepted'))
            ?.split('[')[0]
            ?.trim();
          
          const school = firstAcceptance || 'Various Universities';
          const major = meta.intended_major || 'Undecided';
          
          return {
            name: meta.name || 'Student',
            role: `${school} '28 — ${major}`,
            blurb: meta.narrative_summary || profile.body.substring(0, 200) + '...',
            metadata: meta,
          };
        });
        
        setProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfiles();
  }, []);

  const handleViewProfile = (profile: any) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

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
                <SidebarMenuButton onClick={() => navigate('/admitted-profiles')} tooltip="Admitted Profiles" className="pr-3" isActive={true}>
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
                <SidebarMenuButton onClick={() => navigate('/technology')} tooltip="About" className="pr-3">
                  <Info className="h-[18px] w-[18px]" />
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="relative min-h-screen w-screen overflow-x-hidden">
        {/* subtle warm background with grid (match Index.tsx) */}
        <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
        <div className="absolute inset-0 grid-bg opacity-70" />

        {/* content */}
        <div className="relative px-6 pt-12 pb-12">
        <div className="mx-auto max-w-4xl">
          {/* header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Admitted Profiles</h1>
          </div>

          {/* grid of profile cards */}
          {loading ? (
            <div className="mt-8 text-center text-foreground/60">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="mt-8 text-center text-foreground/60">No profiles found</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profiles.map((p, idx) => (
                <ProfileCard
                  key={`${p.name}-${idx}`}
                  name={p.name}
                  role={p.role}
                  blurb={p.blurb}
                  avatarUrl={p.avatarUrl}
                  onView={() => handleViewProfile(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedProfile?.name || 'Student Profile'}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedProfile && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground/80">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    {selectedProfile.metadata.name && (
                      <div>
                        <span className="text-foreground/60">Name: </span>
                        <span className="text-foreground">{selectedProfile.metadata.name}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.country && (
                      <div>
                        <span className="text-foreground/60">Country: </span>
                        <span className="text-foreground">{selectedProfile.metadata.country}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.state_province && (
                      <div>
                        <span className="text-foreground/60">State: </span>
                        <span className="text-foreground">{selectedProfile.metadata.state_province}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.high_school_type && (
                      <div>
                        <span className="text-foreground/60">High School Type: </span>
                        <span className="text-foreground">{selectedProfile.metadata.high_school_type}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.high_school_name && (
                      <div className="col-span-2">
                        <span className="text-foreground/60">School: </span>
                        <span className="text-foreground">{selectedProfile.metadata.high_school_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Stats */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground/80">Academic Profile</h3>
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    {selectedProfile.metadata.gpa_unweighted && (
                      <div>
                        <span className="text-foreground/60">GPA (Unweighted): </span>
                        <span className="text-foreground font-medium">{selectedProfile.metadata.gpa_unweighted}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.gpa_weighted && (
                      <div>
                        <span className="text-foreground/60">GPA (Weighted): </span>
                        <span className="text-foreground font-medium">{selectedProfile.metadata.gpa_weighted}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.test_type && selectedProfile.metadata.test_score && (
                      <div>
                        <span className="text-foreground/60">{selectedProfile.metadata.test_type}: </span>
                        <span className="text-foreground font-medium">{selectedProfile.metadata.test_score}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.ap_ib_hl_count && (
                      <div>
                        <span className="text-foreground/60">AP/IB Count: </span>
                        <span className="text-foreground">{selectedProfile.metadata.ap_ib_hl_count}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.coursework_rigor && (
                      <div className="col-span-2">
                        <span className="text-foreground/60">Coursework Rigor: </span>
                        <span className="text-foreground">{selectedProfile.metadata.coursework_rigor}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Intended Major & Interests */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground/80">Interests</h3>
                  <div className="space-y-2 text-[12px]">
                    {selectedProfile.metadata.intended_major && (
                      <div>
                        <span className="text-foreground/60">Intended Major: </span>
                        <span className="text-foreground font-medium">{selectedProfile.metadata.intended_major}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.secondary_interests && (
                      <div>
                        <span className="text-foreground/60">Secondary Interests: </span>
                        <span className="text-foreground">{selectedProfile.metadata.secondary_interests}</span>
                      </div>
                    )}
                    {selectedProfile.metadata.hook_context && (
                      <div>
                        <span className="text-foreground/60">Context: </span>
                        <span className="text-foreground">{selectedProfile.metadata.hook_context}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities */}
                {selectedProfile.metadata.activities && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground/80">Activities & Involvement</h3>
                    <div className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedProfile.metadata.activities}
                    </div>
                  </div>
                )}

                {/* Awards */}
                {selectedProfile.metadata.awards && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground/80">Awards & Honors</h3>
                    <div className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedProfile.metadata.awards}
                    </div>
                  </div>
                )}

                {/* Application Results */}
                {selectedProfile.metadata.decisions_compact && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground/80">Application Results</h3>
                    <div className="text-[12px]">
                      {selectedProfile.metadata.accept_count !== undefined && (
                        <div className="mb-2">
                          <span className="text-green-600 font-medium">{selectedProfile.metadata.accept_count} Accepted</span>
                          {selectedProfile.metadata.reject_count !== undefined && (
                            <span className="text-foreground/60"> • </span>
                          )}
                          {selectedProfile.metadata.reject_count !== undefined && (
                            <span className="text-red-600 font-medium">{selectedProfile.metadata.reject_count} Rejected</span>
                          )}
                          {selectedProfile.metadata.waitlist_count !== undefined && selectedProfile.metadata.waitlist_count > 0 && (
                            <>
                              <span className="text-foreground/60"> • </span>
                              <span className="text-orange-600 font-medium">{selectedProfile.metadata.waitlist_count} Waitlisted</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="space-y-1">
                        {selectedProfile.metadata.decisions_compact.split('|').map((decision: string, idx: number) => {
                          const isAccepted = decision.includes('Accepted');
                          const isRejected = decision.includes('Rejected');
                          const isWaitlisted = decision.includes('Waitlisted');
                          
                          return (
                            <div 
                              key={idx} 
                              className={`p-2 rounded border ${
                                isAccepted ? 'bg-green-50 border-green-200' : 
                                isRejected ? 'bg-red-50 border-red-200' : 
                                'bg-orange-50 border-orange-200'
                              }`}
                            >
                              <span className="text-foreground/80">{decision.trim()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Narrative Summary */}
                {selectedProfile.metadata.narrative_summary && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground/80">Profile Summary</h3>
                    <p className="text-[12px] text-foreground/80 leading-relaxed">
                      {selectedProfile.metadata.narrative_summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdmittedProfiles;



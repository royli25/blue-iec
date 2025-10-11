import { useEffect, useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import { fetchAllStudentProfiles } from "@/integrations/supabase/search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";
import { formatStudentProfile, getDecisionColor } from "@/lib/profile-utils";
import type { StudentProfile } from "@/types/profile";

const AdmittedProfiles = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      try {
        const studentProfiles = await fetchAllStudentProfiles();
        const formattedProfiles = studentProfiles.map(formatStudentProfile);
        setProfiles(formattedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfiles();
  }, []);

  const handleViewProfile = (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <PageContainer maxWidth="4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Admitted Profiles</h1>
        </div>

        {/* grid of profile cards */}
        {loading ? (
          <div className="mt-8 text-center text-foreground/60">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="mt-8 text-center text-foreground/60">No profiles found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          const colors = getDecisionColor(decision);
                          
                          return (
                            <div 
                              key={idx} 
                              className={`p-2 rounded border ${colors.bg} ${colors.border}`}
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
      </PageContainer>
    </Layout>
  );
};

export default AdmittedProfiles;



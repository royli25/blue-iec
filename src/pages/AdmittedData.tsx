import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, Users, FileText, ShoppingBag, Download, Eye, Star, Calendar } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import { fetchAllStudentProfiles, matchKb } from "@/integrations/supabase/search";
import { formatStudentProfile, getDecisionColor } from "@/lib/profile-utils";
import type { StudentProfile } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Mock data for essays
interface EssayItem {
  id: string;
  name: string;
  school: string;
  prompt: string;
  excerpt: string;
}

const mockEssays: EssayItem[] = [
  { id: '1', name: 'Ethan Zhang', school: 'UC Berkeley', prompt: 'Why major', excerpt: 'Growing up, I built...' },
  { id: '2', name: 'Sophia Ramirez', school: 'Boston University', prompt: 'Community', excerpt: 'On Saturdays I...' },
  { id: '3', name: 'Aiden Kim', school: 'Brown University', prompt: 'Open Curriculum', excerpt: 'I learn best when...' },
  { id: '4', name: 'Grace Nguyen', school: 'UC San Diego', prompt: 'Intellectual curiosity', excerpt: 'As a volunteer...' },
];

// Mock data for purchased content
interface PurchasedItem {
  id: string;
  title: string;
  description: string;
  type: 'essay' | 'profile' | 'guide' | 'template';
  price: number;
  purchasedAt: string;
  downloadUrl?: string;
  status: 'active' | 'expired' | 'pending';
  rating?: number;
}

const mockPurchasedItems: PurchasedItem[] = [
  {
    id: '1',
    title: 'Harvard Computer Science Essays Collection',
    description: '50+ successful Harvard CS application essays with analysis and tips',
    type: 'essay',
    price: 29.99,
    purchasedAt: '2024-10-15',
    status: 'active',
    rating: 4.8
  },
  {
    id: '2',
    title: 'MIT Engineering Profile Templates',
    description: 'Professional templates for MIT engineering applications',
    type: 'template',
    price: 19.99,
    purchasedAt: '2024-10-10',
    status: 'active',
    rating: 4.6
  },
  {
    id: '3',
    title: 'Ivy League Success Stories Guide',
    description: 'Comprehensive guide with 100+ student success stories',
    type: 'guide',
    price: 39.99,
    purchasedAt: '2024-10-05',
    status: 'active',
    rating: 4.9
  }
];

const AdmittedData = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profiles');
  
  // Profiles state
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<StudentProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSearchLoading, setProfileSearchLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSearchQuery, setProfileSearchQuery] = useState("");
  
  // Essays state
  const [essays, setEssays] = useState<EssayItem[]>(mockEssays);
  const [filteredEssays, setFilteredEssays] = useState<EssayItem[]>(mockEssays);
  const [essaySearchQuery, setEssaySearchQuery] = useState("");
  
  // Purchased content state
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>(mockPurchasedItems);
  const [purchasedLoading, setPurchasedLoading] = useState(false);

  // Load profiles on component mount
  useEffect(() => {
    if (activeTab === 'profiles') {
      loadProfiles();
    }
  }, [activeTab]);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('AdmittedData component mounted');
  }, []);

  const loadProfiles = async () => {
    console.log('Loading profiles...');
    setProfileLoading(true);
    try {
      const studentProfiles = await fetchAllStudentProfiles();
      console.log('Fetched profiles:', studentProfiles.length);
      const formattedProfiles = studentProfiles.map(formatStudentProfile);
      setProfiles(formattedProfiles);
      setFilteredProfiles(formattedProfiles);
      
      // Check if there's a profile parameter in the URL
      const profileName = searchParams.get('profile');
      if (profileName) {
        const matchingProfile = formattedProfiles.find(p => 
          p.name?.toLowerCase() === profileName.toLowerCase() ||
          p.metadata?.name?.toLowerCase() === profileName.toLowerCase()
        );
        if (matchingProfile) {
          setSelectedProfile(matchingProfile);
          setIsProfileModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      // Set empty state on error
      setProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSearch = async (query: string) => {
    setProfileSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    setProfileSearchLoading(true);
    try {
      const matches = await matchKb(query, { kind: 'student_profile' }, 20);
      const searchResults = matches.map(match => formatStudentProfile(match));
      
      const queryLower = query.toLowerCase();
      const filtered = searchResults.filter(profile => {
        const major = profile.metadata?.intended_major?.toLowerCase() || '';
        const role = profile.role?.toLowerCase() || '';
        const blurb = profile.blurb?.toLowerCase() || '';
        const activities = profile.metadata?.activities?.toLowerCase() || '';
        const name = profile.name?.toLowerCase() || '';
        
        return major.includes(queryLower) || role.includes(queryLower) || 
               blurb.includes(queryLower) || activities.includes(queryLower) ||
               name.includes(queryLower);
      });
      
      setFilteredProfiles(filtered);
    } catch (error) {
      console.error('Error searching profiles:', error);
      const queryLower = query.toLowerCase();
      const filtered = profiles.filter(profile => {
        const major = profile.metadata?.intended_major?.toLowerCase() || '';
        const role = profile.role?.toLowerCase() || '';
        const blurb = profile.blurb?.toLowerCase() || '';
        const activities = profile.metadata?.activities?.toLowerCase() || '';
        const name = profile.name?.toLowerCase() || '';
        
        return major.includes(queryLower) || role.includes(queryLower) || 
               blurb.includes(queryLower) || activities.includes(queryLower) ||
               name.includes(queryLower);
      });
      setFilteredProfiles(filtered);
    } finally {
      setProfileSearchLoading(false);
    }
  };

  const handleEssaySearch = (query: string) => {
    setEssaySearchQuery(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredEssays(essays);
      return;
    }
    setFilteredEssays(
      essays.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.school.toLowerCase().includes(q) ||
        e.prompt.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q)
      )
    );
  };

  const handleViewProfile = (profile: StudentProfile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay': return '📝';
      case 'profile': return '👤';
      case 'guide': return '📚';
      case 'template': return '📋';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay': return 'bg-blue-100 text-blue-800';
      case 'profile': return 'bg-green-100 text-green-800';
      case 'guide': return 'bg-purple-100 text-purple-800';
      case 'template': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="flex justify-center py-8">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-3">Admitted Data</h1>
            <p className="text-foreground/60 text-lg">
              Explore successful student profiles, essays, and your purchased content
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="profiles" className="flex items-center justify-center gap-2 px-6 w-full">
                  <Users className="h-4 w-4" />
                  Profiles
                </TabsTrigger>
                <TabsTrigger value="essays" className="flex items-center justify-center gap-2 px-6 w-full">
                  <FileText className="h-4 w-4" />
                  Essays
                </TabsTrigger>
                <TabsTrigger value="purchased" className="flex items-center justify-center gap-2 px-6 w-full">
                  <ShoppingBag className="h-4 w-4" />
                  Purchased
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="mt-6">
              <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for similar profiles... (e.g., 'computer science student with high GPA')"
                  value={profileSearchQuery}
                  onChange={(e) => handleProfileSearch(e.target.value)}
                  className="pl-10 pr-10 h-12 text-sm"
                />
                {profileSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleProfileSearch('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {profileSearchQuery && (
                <p className="text-xs text-muted-foreground">
                  {profileSearchLoading ? "Searching..." : `Found ${filteredProfiles.length} profile${filteredProfiles.length !== 1 ? 's' : ''}`}
                </p>
              )}

              {/* Profiles Grid */}
              {profileLoading ? (
                <div className="mt-8 text-center text-foreground/60">Loading profiles...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="mt-8 text-center text-foreground/60">
                  {profileSearchQuery ? "No profiles found matching your search" : "No profiles found"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto">
                  {filteredProfiles.map((p, idx) => (
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
          </TabsContent>

          {/* Essays Tab */}
          <TabsContent value="essays" className="mt-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search essays... (e.g., school, prompt keywords, student name)"
                  value={essaySearchQuery}
                  onChange={(e) => handleEssaySearch(e.target.value)}
                  className="pl-10 pr-10 h-12 text-sm"
                />
                {essaySearchQuery && (
                  <button
                    onClick={() => handleEssaySearch('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-md"
                    title="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Essays Grid */}
              {filteredEssays.length === 0 ? (
                <div className="mt-8 text-center text-foreground/60">No essays found</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {filteredEssays.map((e) => (
                    <div key={e.id} className="rounded-xl border border-border/70 bg-white/80 shadow-sm backdrop-blur-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-foreground/90 text-sm">{e.name}</div>
                          <div className="text-[12px] text-foreground/60">{e.school} — {e.prompt}</div>
                        </div>
                        <button className="rounded-md border border-brand bg-brand px-3 py-1 text-[12px] text-brand-foreground shadow-sm hover:opacity-95">View</button>
                      </div>
                      <div className="text-[12px] text-foreground/80 leading-relaxed line-clamp-3">
                        {e.excerpt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Purchased Content Tab */}
          <TabsContent value="purchased" className="mt-6">
            <div className="space-y-6">
              {purchasedLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading your purchased content...</p>
                  </div>
                </div>
              ) : purchasedItems.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="h-12 w-12 text-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No purchased content yet</h3>
                    <p className="text-foreground/60 text-center mb-6 max-w-md">
                      You haven't purchased any content yet. Browse our collection of essays, profiles, and guides to get started.
                    </p>
                    <Button onClick={() => navigate('/unlocks')}>
                      Browse Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {purchasedItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getTypeIcon(item.type)}</span>
                            <Badge className={getTypeColor(item.type)}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </Badge>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/60">Price:</span>
                            <span className="font-semibold">${item.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/60">Purchased:</span>
                            <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
                          </div>
                          {item.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-foreground/60">{item.rating}/5</span>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {item.downloadUrl && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Profile Detail Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
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
    </Layout>
  );
};

export default AdmittedData;

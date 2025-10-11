import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// Removed Timeline and GenerateLink per request
import QuarterlyTimeline from "@/components/QuarterlyTimeline";
import { useProfileContext } from "@/hooks/useProfileContext";
import { MessageSquarePlus, NotebookText, UsersRound, Info } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileData } = useProfileContext();

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" className="bg-[hsl(var(--sidebar-background))] border-r border-border">
        <SidebarHeader className="h-8 flex items-center justify-end p-1 group-data-[state=collapsed]:justify-center">
          <SidebarTrigger className="h-4 w-4" />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/')} tooltip="New chat" className="pr-4">
                  <MessageSquarePlus className="h-4 w-4" />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/admitted-profiles')} tooltip="Admitted Profiles" className="pr-4">
                  <UsersRound className="h-4 w-4" />
                  <span>Admitted Profiles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/personal-blueprint')} tooltip="My Blueprint" className="pr-4" data-active={true}>
                  <NotebookText className="h-4 w-4" />
                  <span>My Blueprint</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/technology')} tooltip="About" className="pr-4">
                  <Info className="h-4 w-4" />
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="relative min-h-screen w-screen overflow-x-hidden">

      {/* subtle warm background (no global grid) */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />

      {/* content */}
      <div className="relative px-0 pt-4 pb-8">
        <div className="mx-auto max-w-none w-full">
          <div className="space-y-3" />
          {/* Quarterly timeline with side gutters */}
          <div className="mt-4 px-[7.5%]">
            {(() => {
              const now = new Date();
              const currentYear = now.getFullYear();
              let endYear: number | null = null;
              // Try to parse a 4-digit graduation year from profile
              const raw = profileData?.gradeLevel;
              if (raw) {
                const year = parseInt(String(raw), 10);
                if (!Number.isNaN(year) && year >= currentYear && year <= currentYear + 10) {
                  endYear = year;
                }
              }
              // Fallback to explicit 2028 based on this account
              if (!endYear) endYear = 2028;
              const startStr = `${currentYear}-01`;
              const endStr = `${endYear}-12`;
              return (
            <QuarterlyTimeline
              start={startStr}
              end={endStr}
              categories={["Milestones", "Webstore", "Self Serve", "Mobile", "Help Desk", "Infrastructure"]}
              items={[
                { id: 'm1', category: 'Milestones', label: 'Android Mobile App', start: `${new Date().getFullYear()}-02`, end: `${new Date().getFullYear()}-04` },
                { id: 'm2', category: 'Milestones', label: 'iOS App Launch', start: `${new Date().getFullYear()}-05`, end: `${new Date().getFullYear()}-06` },
                { id: 'w1', category: 'Webstore', label: 'Guest Checkout', start: `${new Date().getFullYear()}-07`, end: `${new Date().getFullYear()}-09` },
                { id: 's1', category: 'Self Serve', label: 'Single Sign-On', start: `${new Date().getFullYear()}-03`, end: `${new Date().getFullYear()}-03` },
                { id: 's2', category: 'Self Serve', label: 'Language Localization', start: `${new Date().getFullYear()}-03`, end: `${new Date().getFullYear()}-06` },
                { id: 'mb1', category: 'Mobile', label: 'iOS 1.0', start: `${new Date().getFullYear()}-05`, end: `${new Date().getFullYear()}-07` },
                { id: 'mb2', category: 'Mobile', label: 'Push Notifications', start: `${new Date().getFullYear()}-08`, end: `${new Date().getFullYear()}-10` },
                { id: 'hd1', category: 'Help Desk', label: 'Accessibility Improvements', start: `${new Date().getFullYear()}-04`, end: `${new Date().getFullYear()}-07` },
                { id: 'inf1', category: 'Infrastructure', label: 'Library Upgrades', start: `${new Date().getFullYear()}-06`, end: `${new Date().getFullYear()}-08` },
              ]}
            />
              );
            })()}
          </div>
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
};

export default PersonalBlueprint;

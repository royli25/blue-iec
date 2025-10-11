import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createChatCompletion } from "@/integrations/openai/client";
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

const ApplicationContext = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const [{ data: ctx }, { data: details }] = await Promise.all([
        supabase.from('application_contexts').select('*').maybeSingle(),
        supabase.from('profile_details').select('*').maybeSingle(),
      ]);
      if (ctx) setContent((ctx as any).content || "");
      if (details) setProfile(details);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) { navigate('/auth'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('application_contexts')
      .upsert({ user_id: user.id, content }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Your application context has been saved.' });
    }
  };

  // Manual generation removed; context is auto-updated when profile is saved.

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
                <SidebarMenuButton onClick={() => navigate('/technology')} tooltip="About" className="pr-3">
                  <Info className="h-[18px] w-[18px]" />
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="relative min-h-screen w-screen overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
        <div className="absolute inset-0 grid-bg opacity-70" />
        <div className="relative px-6 pt-12 pb-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-[14px] font-semibold text-foreground/80 mb-2">Application Context</h1>
          <div className="rounded-xl border border-border/70 bg-white/80 backdrop-blur-md shadow-sm">
            <textarea
              rows={14}
              className="w-full rounded-xl bg-transparent px-5 py-4 text-[14px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder="Add any context you want the AI to consider for your profile..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
      </div>
    </SidebarProvider>
  );
};

export default ApplicationContext;



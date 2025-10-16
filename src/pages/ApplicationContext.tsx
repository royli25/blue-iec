import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PageContainer } from "@/components/PageContainer";

const ApplicationContext = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
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
    <Layout>
      <PageContainer maxWidth="3xl" className="pt-12 pb-8">
        <h1 className="text-[14px] font-semibold text-foreground/80 mb-2">{t('profile.applicationContext')}</h1>
          <div className="rounded-xl border border-border/70 bg-white/80 backdrop-blur-md shadow-sm">
            <textarea
              rows={14}
              className="w-full rounded-xl bg-transparent px-5 py-4 text-[14px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder={t('profile.addContext')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        <div className="mt-3 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white disabled:opacity-50">{saving ? t('profile.saving') : t('profile.save')}</button>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default ApplicationContext;



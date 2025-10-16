import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import type { Activity, APExam, Award, ProfileData } from "@/types/profile";
import { formatActivities, formatAPExams, formatAwards } from "@/lib/profile-utils";

const ProfileContext = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [gradeLevel, setGradeLevel] = useState("");
  const [demographic, setDemographic] = useState("");
  const [school, setSchool] = useState("");
  const [gpa, setGpa] = useState("");
  const [sat, setSat] = useState("");
  const [activities, setActivities] = useState<Activity[]>([{name: "", description: ""}]);
  const [apExams, setApExams] = useState<APExam[]>([{ exam: "", score: "" }]);
  const [awards, setAwards] = useState<Award[]>([{ name: "", level: "" }]);
  const [saving, setSaving] = useState(false);
  // Unsaved-changes tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const pendingActionRef = useRef<null | (() => void)>(null);
  const initialSnapshotRef = useRef<string>("");
  const saveCallbackRef = useRef<((silent?: boolean) => Promise<void>) | null>(null);
  const DRAFT_KEY = `profile_draft_${user?.id || 'anonymous'}`;

  const currentSnapshot = () => JSON.stringify({
    gradeLevel,
    demographic,
    school,
    gpa,
    sat,
    activities,
    apExams,
    awards,
  });
  const buildContext = () => {
    const lines: string[] = [];
    if (gradeLevel) lines.push(`Graduation Year: ${gradeLevel}`);
    if (demographic) lines.push(`Demographic: ${demographic}`);
    if (school) lines.push(`School: ${school}`);
    if (gpa) lines.push(`GPA: ${gpa}`);
    if (sat) lines.push(`SAT: ${sat}`);
    if (activities && activities.filter(a => a.name || a.description).length) {
      lines.push(`Activities: ${formatActivities(activities)}`);
    }
    if (apExams && apExams.filter(a => a.exam || a.score).length) {
      lines.push(`AP Exams: ${formatAPExams(apExams)}`);
    }
    if (awards && awards.filter(a => a.name || a.level).length) {
      lines.push(`Awards: ${formatAwards(awards)}`);
    }
    return `Application Context\n${lines.join('\n')}`;
  };

  const handleSave = async (silent = false) => {
    if (!user) { navigate('/auth'); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      grade_level: gradeLevel || null,
      demographic: demographic || null,
      school: school || null,
      gpa: gpa || null,
      sat: sat || null,
      activities: activities && activities.filter(a => a.name || a.description).length ? activities.filter(a => a.name || a.description) as any : null,
      ap_exams: apExams && apExams.filter(e => e.exam || e.score).length ? apExams.filter(e => e.exam || e.score) as any : null,
      awards: awards && awards.filter(a => a.name || a.level).length ? awards.filter(a => a.name || a.level) as any : null,
    };
    const { error } = await supabase.from('profile_details').upsert(payload as any, { onConflict: 'user_id' });
    if (error) {
      setSaving(false);
      if (!silent) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      }
      throw error; // Re-throw for auto-save error handling
    }

    if (!silent) {
      toast({ title: 'Saved', description: 'Profile has been updated.' });
    }
    // mark as clean after successful save and clear draft
    initialSnapshotRef.current = currentSnapshot();
    setIsDirty(false);
    localStorage.removeItem(DRAFT_KEY); // Clear draft after successful save
    setSaving(false);
  };

  const handleReset = () => {
    setGradeLevel("");
    setDemographic("");
    setSchool("");
    setGpa("");
    setSat("");
    setActivities([{name: "", description: ""}]);
    setApExams([{ exam: "", score: "" }]);
    setAwards([{ name: "", level: "" }]);
    localStorage.removeItem(DRAFT_KEY); // Clear draft on reset
  };

  const handleDiscard = () => {
    localStorage.removeItem(DRAFT_KEY); // Clear draft on discard
    requestNavigate(-1);
  };

  useEffect(() => {
    // On first load, ensure viewport is at top
    window.scrollTo(0, 0);
    if (!user) { navigate('/auth'); return; }
    (async () => {
      // Check for draft in localStorage first
      const draftStr = localStorage.getItem(DRAFT_KEY);
      let draft = null;
      if (draftStr) {
        try {
          draft = JSON.parse(draftStr);
        } catch (e) {
          // Invalid draft, ignore
        }
      }

      const { data } = await supabase
        .from('profile_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Use draft if it exists and is newer, otherwise use database data
      const loadedGradeLevel = draft?.gradeLevel ?? (data as any)?.grade_level ?? "";
      const loadedDemographic = draft?.demographic ?? (data as any)?.demographic ?? "";
      const loadedSchool = draft?.school ?? (data as any)?.school ?? "";
      const loadedGpa = draft?.gpa ?? (data as any)?.gpa ?? "";
      const loadedSat = draft?.sat ?? (data as any)?.sat ?? "";
      const loadedActivities = draft?.activities ?? ((data as any)?.activities as {name: string, description: string}[] | null) ?? [{name: "", description: ""}];
      const loadedApExams = draft?.apExams ?? ((data as any)?.ap_exams as { exam: string; score: string }[] | null) ?? [{ exam: "", score: "" }];
      const loadedAwards = draft?.awards ?? ((data as any)?.awards as { name: string; level: string }[] | null) ?? [{ name: "", level: "" }];
      
      setGradeLevel(loadedGradeLevel);
      setDemographic(loadedDemographic);
      setSchool(loadedSchool);
      setGpa(loadedGpa);
      setSat(loadedSat);
      setActivities(loadedActivities);
      setApExams(loadedApExams);
      setAwards(loadedAwards);
      
      // ALWAYS establish initial snapshot after data load, even if no data exists
      initialSnapshotRef.current = JSON.stringify({
        gradeLevel: loadedGradeLevel,
        demographic: loadedDemographic,
        school: loadedSchool,
        gpa: loadedGpa,
        sat: loadedSat,
        activities: loadedActivities,
        apExams: loadedApExams,
        awards: loadedAwards,
      });
      setIsDirty(false);
    })();

    // Listen for shared profile imports
    const onImport = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setGradeLevel(detail.gradeLevel ?? "");
      setDemographic(detail.demographic ?? "");
      setSchool(detail.school ?? "");
      setGpa(detail.gpa ?? "");
      setSat(detail.sat ?? "");
      setActivities(Array.isArray(detail.activities) && detail.activities.length ? detail.activities : [{name: "", description: ""}]);
      setApExams(Array.isArray(detail.apExams) && detail.apExams.length ? detail.apExams : [{ exam: "", score: "" }]);
      setAwards(Array.isArray(detail.awards) && detail.awards.length ? detail.awards : [{ name: "", level: "" }]);
      window.scrollTo(0, 0);
    };
    window.addEventListener('profile-import', onImport as EventListener);
    return () => window.removeEventListener('profile-import', onImport as EventListener);
  }, [user]);

  // Dirty tracking and localStorage persistence
  useEffect(() => {
    const changed = initialSnapshotRef.current && currentSnapshot() !== initialSnapshotRef.current;
    setIsDirty(Boolean(changed));
    
    // Save draft to localStorage whenever data changes
    if (changed) {
      const draft = {
        gradeLevel,
        demographic,
        school,
        gpa,
        sat,
        activities,
        apExams,
        awards,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [gradeLevel, demographic, school, gpa, sat, activities, apExams, awards, DRAFT_KEY]);

  // Warn on tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler as any);
    return () => window.removeEventListener('beforeunload', handler as any);
  }, [isDirty]);

  // Keep saveCallbackRef up to date
  useEffect(() => {
    saveCallbackRef.current = handleSave;
  });

  // Auto-save on component unmount (when navigating away)
  useEffect(() => {
    return () => {
      if (isDirty && user && saveCallbackRef.current) {
        // Silent auto-save on unmount using ref to avoid stale closure
        saveCallbackRef.current(true).catch(() => {
          // Ignore errors on unmount to avoid console warnings
        });
      }
    };
  }, [isDirty, user]);

  const requestNavigate = async (dest: string | number) => {
    if (isDirty) {
      // Auto-save before navigating
      try {
        await handleSave(true); // Silent save
        // After successful save, navigate
        if (typeof dest === 'number') navigate(dest as number);
        else navigate(dest as string);
      } catch (error) {
        // If save fails, show the leave dialog
        pendingActionRef.current = () => {
          if (typeof dest === 'number') navigate(dest as number);
          else navigate(dest as string);
        };
        setShowLeaveDialog(true);
      }
    } else {
      if (typeof dest === 'number') navigate(dest as number);
      else navigate(dest as string);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar onNavigate={requestNavigate} />
      <div className="relative min-h-screen w-screen overflow-x-hidden">
        {/* top-right auth button / email */}
        <div className="absolute top-4 right-4 z-10 text-[12px]">
        {user ? (
          <span className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm">
            {user.email}
          </span>
        ) : (
          <button
            onClick={() => requestNavigate('/auth')}
            className="rounded-md border border-border bg-white/70 px-4 py-0 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white h-[24px] min-h-0 leading-none"
          >
{t('auth.logIn')}
          </button>
        )}
      </div>

      {/* subtle warm background with grid */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* content */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="mx-auto max-w-2xl flex flex-col">
          <div className="grid grid-cols-1 gap-1.5 text-[12px]">
            <div className="space-y-0.5">
              <label htmlFor="grad-year" className="text-foreground/80">{t('profile.graduationYear')}</label>
              <Select value={gradeLevel} onValueChange={(v) => setGradeLevel(v)}>
                <SelectTrigger id="grad-year" className="w-full rounded-md border border-border bg-white/70 px-3 py-0 text-[12px] text-foreground/80 h-[24px] min-h-0 leading-none">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="border border-border bg-white/90 backdrop-blur-md shadow-sm text-[12px] text-foreground/80 max-h-60 overflow-y-auto">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={String(year)} className="text-[12px] text-foreground/80 focus:bg-white">
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0.5">
              <label htmlFor="demographic" className="text-foreground/80">{t('profile.demographic')}</label>
              <input id="demographic" className="w-full rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80" placeholder="e.g., Latino, Black, Asian, White, etc." value={demographic} onChange={(e) => setDemographic(e.target.value)} />
            </div>
            <div className="space-y-0.5">
              <label htmlFor="school" className="text-foreground/80">{t('profile.school')}</label>
              <input id="school" className="w-full rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80" placeholder="High school / college name" value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <label htmlFor="gpa" className="text-foreground/80">{t('profile.gpa')}</label>
                <input id="gpa" className="w-full rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80" placeholder="3.8 UW / 4.2 W" value={gpa} onChange={(e) => setGpa(e.target.value)} />
              </div>
              <div className="space-y-0.5">
                <label htmlFor="sat" className="text-foreground/80">{t('profile.sat')}</label>
                <input id="sat" className="w-full rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80" placeholder="e.g., 1520 (760 EBRW / 760 Math)" value={sat} onChange={(e) => setSat(e.target.value)} />
              </div>
            </div>
            {/* Activities list (up to 10) */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-foreground/80">{t('profile.activities')}</label>
                <button
                  onClick={() => activities.length < 10 && setActivities([...activities, {name: "", description: ""}])}
                  className="rounded-md border border-border/70 bg-white/50 px-2.5 py-0 text-[11px] text-foreground/70 backdrop-blur-sm hover:bg-white/70 h-[24px] min-h-0 leading-none"
                  type="button"
                >{t('profile.add')}</button>
              </div>
              <div className="grid gap-0.5">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <input
                      className="flex-1 rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80"
                      placeholder={`Activity ${idx + 1}`}
                      value={act.name}
                      onChange={(e) => setActivities(activities.map((a, i) => (i === idx ? {...a, name: e.target.value} : a)))}
                    />
                    <textarea
                      className="flex-1 rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80 resize-none"
                      placeholder="description"
                      value={act.description}
                      onChange={(e) => setActivities(activities.map((a, i) => (i === idx ? {...a, description: e.target.value} : a)))}
                      rows={2}
                    />
                    {activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setActivities(activities.filter((_, i) => i !== idx))}
                      className="rounded-md border border-border/70 bg-white/70 px-2.5 py-0 text-[12px] text-foreground/70 h-[24px] min-h-0 leading-none hover:bg-white"
                      >{t('profile.remove')}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* AP Scores */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-foreground/80">{t('profile.apScores')}</label>
                <button
                  onClick={() => setApExams([...apExams, { exam: "", score: "" }])}
                  className="rounded-md border border-border/70 bg-white/50 px-2.5 py-0 text-[11px] text-foreground/70 backdrop-blur-sm hover:bg-white/70 h-[24px] min-h-0 leading-none"
                  type="button"
                >{t('profile.add')}</button>
              </div>
              <div className="grid gap-0.5">
                {apExams.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <input
                      className="w-3/4 rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80"
                      placeholder="AP US History"
                      value={row.exam}
                      onChange={(e) => setApExams(apExams.map((r, i) => (i === idx ? { ...r, exam: e.target.value } : r)))}
                    />
                    <Select
                      value={row.score}
                      onValueChange={(v) => setApExams(apExams.map((r, i) => (i === idx ? { ...r, score: v } : r)))}
                    >
                      <SelectTrigger className="w-1/4 rounded-md border border-border bg-white/70 px-3 py-0 text-[12px] text-foreground/80 h-[24px] min-h-0 leading-none">
                        <SelectValue placeholder="Score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setApExams(apExams.filter((_, i) => i !== idx))}
                      className="rounded-md border border-border/70 bg-white/70 px-2.5 py-0 text-[12px] text-foreground/70 h-[24px] min-h-0 leading-none hover:bg-white"
                    >{t('profile.remove')}</button>
                  </div>
                ))}
              </div>
            </div>
            {/* Awards */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-foreground/80">{t('profile.awards')}</label>
                <button
                  onClick={() => setAwards([...awards, { name: "", level: "" }])}
                  className="rounded-md border border-border/70 bg-white/50 px-2.5 py-0 text-[11px] text-foreground/70 backdrop-blur-sm hover:bg-white/70 h-[24px] min-h-0 leading-none"
                  type="button"
                >{t('profile.add')}</button>
              </div>
              <div className="grid gap-0.5">
                {awards.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <input
                      className="w-3/4 rounded-md border border-border bg-white/70 px-3 py-0.5 text-[12px] text-foreground/80"
                      placeholder="Award title"
                      value={row.name}
                      onChange={(e) => setAwards(awards.map((a, i) => (i === idx ? { ...a, name: e.target.value } : a)))}
                    />
                    <Select
                      value={row.level}
                      onValueChange={(v) => setAwards(awards.map((a, i) => (i === idx ? { ...a, level: v } : a)))}
                    >
                      <SelectTrigger className="w-1/4 rounded-md border border-border bg-white/70 px-3 py-0 text-[12px] text-foreground/80 h-[24px] min-h-0 leading-none">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="provincial">Provincial</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setAwards(awards.filter((_, i) => i !== idx))}
                      className="rounded-md border border-border/70 bg-white/70 px-2.5 py-0 text-[12px] text-foreground/70 h-[24px] min-h-0 leading-none hover:bg-white"
                    >{t('profile.remove')}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 flex items-center justify-between gap-3">
            <div className="text-[12px] text-foreground/60">
              Profile data will be automatically included in your chat conversations
            </div>
            <div className="flex gap-2">
              <button onClick={handleDiscard} className="rounded-md border border-border bg-white/70 px-4 py-0 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white h-[24px] min-h-0 leading-none">Discard changes</button>
              <button onClick={handleReset} className="rounded-md border border-border bg-white/70 px-4 py-0 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white h-[24px] min-h-0 leading-none">Reset</button>
              <button onClick={() => handleSave(false)} disabled={saving} className="rounded-md border border-border bg-white/70 px-4 py-0 text-[12px] text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white disabled:opacity-50 disabled:pointer-events-none h-[24px] min-h-0 leading-none">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>

          {/* Additional Features */}
          <AdditionalFeatures
            data={{
              gradeLevel,
              demographic,
              school,
              gpa,
              sat,
              activities,
              apExams,
              awards,
            }}
          />
        </div>
      </div>
      {/* Leave without saving dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowLeaveDialog(false)} />
          <div className="relative w-[360px] rounded-md border border-border bg-white/90 backdrop-blur-md shadow-lg p-4 text-[12px] text-foreground/80">
            <div className="font-semibold mb-2">Unsaved changes</div>
            <div className="mb-3">You have unsaved changes. Are you sure you want to leave this page?</div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md border border-border bg-white/70 px-3 py-0 text-foreground/70 h-[24px] min-h-0 leading-none hover:bg-white"
                onClick={() => setShowLeaveDialog(false)}
              >Stay</button>
              <button
                className="rounded-md border border-border bg-white px-3 py-0 text-foreground/80 shadow-sm h-[24px] min-h-0 leading-none hover:bg-white"
                onClick={() => { setShowLeaveDialog(false); pendingActionRef.current?.(); }}
              >Leave without saving</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </SidebarProvider>
  );
};

export default ProfileContext;



// --- Local component: Additional Features ---
const AdditionalFeatures = ({
  data,
}: {
  data: {
    gradeLevel: string;
    demographic: string;
    school: string;
    gpa: string;
    sat: string;
    activities: {name: string, description: string}[];
    apExams: { exam: string; score: string }[];
    awards: { name: string; level: string }[];
  };
}) => {
  const exportPdf = async () => {
    // Simple, dependency-free PDF via window.print() on a new document
    const html = `
      <html>
        <head>
          <title>Profile Export</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            h2 { font-size: 16px; margin-top: 16px; margin-bottom: 6px; }
            p, li { font-size: 12px; line-height: 1.6; }
            ul, ol { margin: 0; padding-left: 18px; }
            .muted { color: #6b7280; }
            .section { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>Profile Export</h1>
          <div class="section">
            <h2>Basics</h2>
            <p><strong>Graduation Year:</strong> ${escapeHtml(data.gradeLevel || '-') }</p>
            <p><strong>Demographic:</strong> ${escapeHtml(data.demographic || '-') }</p>
            <p><strong>School:</strong> ${escapeHtml(data.school || '-') }</p>
            <p><strong>GPA:</strong> ${escapeHtml(data.gpa || '-') } &nbsp; <strong>SAT:</strong> ${escapeHtml(data.sat || '-') }</p>
          </div>
          <div class="section">
            <h2>Activities</h2>
            <ul>
              ${data.activities.filter(a => a.name || a.description).map((a) => `<li>${escapeHtml(a.name)}${a.description ? ` — ${escapeHtml(a.description)}` : ''}</li>`).join('') || '<li class="muted">None listed</li>'}
            </ul>
          </div>
          <div class="section">
            <h2>AP Exams</h2>
            <ul>
              ${data.apExams.filter((e) => e && (e.exam || e.score)).map((e) => `<li>${escapeHtml(e.exam || '')}${e.score ? ` — Score ${escapeHtml(e.score)}` : ''}</li>`).join('') || '<li class="muted">None listed</li>'}
            </ul>
          </div>
          <div class="section">
            <h2>Awards</h2>
            <ul>
              ${data.awards.filter((w) => w && (w.name || w.level)).map((w) => `<li>${escapeHtml(w.name || '')}${w.level ? ` (${escapeHtml(w.level)})` : ''}</li>`).join('') || '<li class="muted">None listed</li>'}
            </ul>
          </div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="features">
          <AccordionTrigger className="text-[12px]">Additional Features</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-foreground/70">Export your profile details as a PDF</span>
              <button onClick={exportPdf} className="rounded-md border border-border bg-white px-3 py-0 text-[12px] text-foreground/70 shadow-sm hover:bg-white h-[24px] min-h-0 leading-none">Export PDF</button>
            </div>
            <div className="mt-3 h-px bg-border" />
            <ShareProfile data={data} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);
}

// --- Share Profile block ---
const ShareProfile = ({
  data,
}: {
  data: {
    gradeLevel: string;
    demographic: string;
    school: string;
    gpa: string;
    sat: string;
    activities: {name: string, description: string}[];
    apExams: { exam: string; score: string }[];
    awards: { name: string; level: string }[];
  };
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [importSlug, setImportSlug] = useState("");

  const createShare = async () => {
    if (!user) { toast({ title: 'Login required', description: 'Please log in to create a share link.', variant: 'destructive' }); return; }
    // Generate a random token
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2, 10);
    // Snapshot current profile inputs
    const snapshot = {
      gradeLevel: data.gradeLevel,
      demographic: data.demographic,
      school: data.school,
      gpa: data.gpa,
      sat: data.sat,
      activities: data.activities,
      apExams: data.apExams,
      awards: data.awards,
    };
    const { error } = await supabase
      .from('share_links')
      .insert({
        user_id: user.id,
        resource_type: 'profile_details',
        resource_id: null,
        token,
        title: 'Profile snapshot',
        snapshot,
      });
    if (error) { toast({ title: 'Share failed', description: error.message, variant: 'destructive' }); return; }
    const url = `${window.location.origin}/profile?share=${token}`;
    setGeneratedUrl(url);
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({ title: 'Share link created', description: 'URL copied to clipboard.' });
  };

  const importShare = async () => {
    if (!importSlug.trim()) return;
    const token = importSlug.trim().replace(/^.*[?&]share=/, '');
    // Type cast to any to avoid RPC generic typing friction
    const { data, error } = await (supabase as any).rpc('get_share_snapshot', { p_token: token });
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      toast({ title: 'Import failed', description: error?.message || 'Profile not found.' , variant: 'destructive' });
      return;
    }
    const p = (Array.isArray(data) ? (data as any)[0].snapshot : (data as any).snapshot) as any;
    window.dispatchEvent(new CustomEvent('profile-import', { detail: p }));
    toast({ title: 'Imported', description: 'Profile loaded into the form.' });
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-foreground/70">Create a shareable profile URL</span>
        <button onClick={createShare} className="rounded-md border border-border bg-white px-3 py-0 text-[12px] text-foreground/70 shadow-sm hover:bg-white h-[24px] min-h-0 leading-none">Generate URL</button>
      </div>
      {generatedUrl && (
        <div className="text-[12px] text-foreground/70 break-all">{generatedUrl}</div>
      )}
      <div className="flex items-center gap-2">
        <input
          value={importSlug}
          onChange={(e) => setImportSlug(e.target.value)}
          placeholder="Paste share URL or code"
          className="flex-1 rounded-md border border-border bg-white/70 px-3 py-1 text-[12px] text-foreground/80"
        />
        <button onClick={importShare} className="rounded-md border border-border bg-white px-3 py-0 text-[12px] text-foreground/70 shadow-sm hover:bg-white h-[24px] min-h-0 leading-none">Load</button>
      </div>
      <p className="text-[11px] text-foreground/60">Tip: You can paste either the full URL or just the code after ?share=</p>
    </div>
  );
};

import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/blueprint/RichTextEditor";
import TableOfContents from "@/components/blueprint/TableOfContents";
import QuestionSidebarPlaceholder from "@/components/blueprint/QuestionSidebarPlaceholder";
import { EditorBridgeProvider } from "@/context/EditorBridge";
// Removed resizable split between ToC and editor

const PersonalBlueprint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doc, setDoc] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const saveTimer = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [tocLeft, setTocLeft] = useState<number>(0);
  const [sidebarWidth, setSidebarWidth] = useState<number>(380);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const { data, error } = await (supabase as any)
        .from('personal_blueprints')
        .select('content')
        .maybeSingle();
      if (error) {
        toast({ title: 'Load failed', description: error.message, variant: 'destructive' });
      } else if (data && (data as any).content) {
        setDoc((data as any).content);
      } else {
        setDoc(null);
      }
    })();
  }, [user]);

  const handleDocChange = (value: any) => {
    setDoc(value);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      const { error } = await (supabase as any)
        .from('personal_blueprints')
        .upsert({ user_id: user.id, content: value }, { onConflict: 'user_id' });
      setSaving(false);
      if (error) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      }
    }, 800);
  };

  // Sidebar resize handlers
  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const rightEdge = window.innerWidth; // measure against viewport right
      const raw = rightEdge - e.clientX; // width from cursor to right edge
      const clamped = Math.max(280, Math.min(640, raw));
      setSidebarWidth(clamped);
      // Recalculate ToC left on resize drag
      requestAnimationFrame(() => {
        if (!contentRef.current) return;
        const rect = contentRef.current.getBoundingClientRect();
        const cs = window.getComputedStyle(contentRef.current);
        const padLeft = parseFloat(cs.paddingLeft || '0');
        setTocLeft(rect.left + padLeft);
      });
    };
    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Measure ToC left on mount, resize, and when sidebar width changes
  useEffect(() => {
    const update = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const cs = window.getComputedStyle(contentRef.current);
      const padLeft = parseFloat(cs.paddingLeft || '0');
      // Position ToC at the content start, not the container start
      setTocLeft(rect.left + padLeft);
    };
    update();
    window.addEventListener('resize', update);
    // Also observe local layout shifts (e.g., left sidebar expanding)
    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window && contentRef.current) {
      ro = new ResizeObserver(() => update());
      ro.observe(contentRef.current);
    }
    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, [sidebarWidth]);

  const content = (
    <Layout>
      <div
        ref={gridRef}
        className="grid w-full items-start"
        style={{ gridTemplateColumns: `minmax(0,1fr)` }}
      >
        {/* Left column: content with padding to avoid fixed sidebar overlap */}
        <div
          ref={contentRef}
          className="min-h-[100dvh] w-full py-4 pl-4 md:pl-6 pr-0 min-w-0 relative"
          style={{
            paddingRight: `${sidebarWidth}px`,
            ['--qs-width' as any]: `${sidebarWidth}px`,
            ['--editor-left' as any]: `${tocLeft + 260}px`,
            ['--editor-top' as any]: '1rem',
            ['--editor-toolbar-height' as any]: '2rem',
          }}
        >
          {/* Fixed Table of Contents on the left */}
          <div
            className="fixed z-20"
            style={{ left: `${tocLeft}px`, width: "260px", height: "100dvh", top: "1rem" }}
          >
            <div className="h-full overflow-auto">
              <TableOfContents editor={editorInstance} />
            </div>
          </div>

          {/* Editor shifted right to make room for the fixed ToC */}
          <div className="min-h-[100dvh] ml-[260px] overflow-visible">
            <RichTextEditor value={doc} onChange={handleDocChange} saving={saving} onMount={setEditorInstance} />
          </div>
        </div>
      </div>

      {/* Fixed sidebar fallback */}
      <div
        className="fixed top-0 right-0 h-[100dvh] z-30 bg-background"
        style={{ width: `${sidebarWidth}px` }}
        data-sticky-fixed
      >
        <div
          onMouseDown={onResizeStart}
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-10 bg-transparent hover:bg-border active:bg-border"
          aria-label="Resize questions sidebar"
        />
        <QuestionSidebarPlaceholder />
      </div>
    </Layout>
  );

  return (
    <EditorBridgeProvider>
      {content}
    </EditorBridgeProvider>
  );
};

export default PersonalBlueprint;

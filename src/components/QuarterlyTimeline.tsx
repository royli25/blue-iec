import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";

type TimelineItem = {
  id: string;
  category: string;
  label: string;
  start: string; // YYYY-MM
  end: string;   // YYYY-MM (inclusive)
  color?: string; // tailwind class or hex
  heightPx?: number; // optional track height
};

type QuarterlyTimelineProps = {
  start: string; // YYYY-MM
  end: string;   // YYYY-MM
  categories: string[];
  items: TimelineItem[];
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseYm(ym: string): Date {
  const [y, m] = ym.split("-").map((v) => parseInt(v, 10));
  return new Date(y, (m || 1) - 1, 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Event bar palette (from screenshot): tan shades
const DEFAULT_COLORS = [
  "#DABF9C",
  "#E8DAC0",
  "#F1E9DA",
];

const MONTH_CELL_WIDTH_PX = 140;

const QuarterlyTimeline: React.FC<QuarterlyTimelineProps> = ({ start, end, categories, items }) => {
  // Mutable widths and items for interactions (with persistence)
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('qt.leftWidth');
    const n = saved ? parseInt(saved, 10) : 300;
    return Number.isFinite(n) ? n : 300;
  });
  const [itemState, setItemState] = useState<TimelineItem[]>(() => {
    try {
      const saved = localStorage.getItem('qt.items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((o) => o && typeof o.id === 'string')) {
          return parsed as TimelineItem[];
        }
      }
    } catch {}
    return items;
  });
  // If saved state is missing or empty, seed from defaults and persist
  useEffect(() => {
    const saved = localStorage.getItem('qt.items');
    let shouldSeed = true;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) shouldSeed = false;
      } catch {}
    }
    if (shouldSeed) {
      setItemState(items);
      localStorage.setItem('qt.items', JSON.stringify(items));
    }
  }, [items]);
  useEffect(() => { localStorage.setItem('qt.items', JSON.stringify(itemState)); }, [itemState]);
  useEffect(() => { localStorage.setItem('qt.leftWidth', String(leftWidth)); }, [leftWidth]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [categoryHeights, setCategoryHeights] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('qt.catHeights');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem('qt.catHeights', JSON.stringify(categoryHeights));
  }, [categoryHeights]);
  const months = useMemo(() => {
    const s = parseYm(start);
    const e = parseYm(end);
    const out: { key: string; label: string; year: number; monthIndex: number }[] = [];
    let cur = new Date(s);
    while (cur <= e) {
      const key = monthKey(cur);
      out.push({ key, label: MONTH_LABELS[cur.getMonth()], year: cur.getFullYear(), monthIndex: cur.getMonth() });
      cur = addMonths(cur, 1);
    }
    return out;
  }, [start, end]);

  const quarters = useMemo(() => {
    // Build quarter groups with startIndex into months[] and span (# of months)
    const groups: { label: string; span: number; startIndex: number }[] = [];
    let idx = 0;
    while (idx < months.length) {
      const y = months[idx].year;
      const quarter = Math.floor(months[idx].monthIndex / 3) + 1;
      const qLabel = `Q${quarter} ${y}`;
      const startIndex = idx;
      let span = 0;
      while (idx < months.length && months[idx].year === y && Math.floor(months[idx].monthIndex / 3) + 1 === quarter) {
        span++;
        idx++;
      }
      groups.push({ label: qLabel, span, startIndex });
    }
    return groups;
  }, [months]);

  // Precompute coordinates for items
  const positioned = useMemo(() => {
    const monthIndexByKey = new Map(months.map((m, idx) => [m.key, idx] as const));
    return itemState.map((it, idx) => {
      const startIdx = monthIndexByKey.get(it.start) ?? 0;
      const endIdx = monthIndexByKey.get(it.end) ?? months.length - 1;
      const left = (startIdx / months.length) * 100;
      const width = ((endIdx - startIdx + 1) / months.length) * 100;
      const color = it.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      return { ...it, startIdx, endIdx, left, width, color, heightPx: it.heightPx ?? 32 };
    });
  }, [itemState, months]);

  const leftColWidth = leftWidth; // px, resizable sticky note column
  const contentMinWidth = leftColWidth + months.length * MONTH_CELL_WIDTH_PX;

  // Helpers for resizing bars
  const dragRef = useRef<{
    id: string;
    side: 'left' | 'right';
    startX: number;
    origStartIdx: number;
    origEndIdx: number;
  } | null>(null);

  const ymFromIndex = (idx: number) => months[Math.max(0, Math.min(months.length - 1, idx))].key;

  const onBarHandleMouseDown = useCallback((e: React.MouseEvent, id: string, side: 'left' | 'right') => {
    e.preventDefault();
    const found = positioned.find(p => p.id === id);
    if (!found) return;
    dragRef.current = {
      id,
      side,
      startX: e.clientX,
      origStartIdx: found.startIdx,
      origEndIdx: found.endIdx,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const deltaMonths = Math.round(dx / MONTH_CELL_WIDTH_PX);
      let newStart = dragRef.current.origStartIdx;
      let newEnd = dragRef.current.origEndIdx;
      if (dragRef.current.side === 'left') {
        newStart = Math.min(newEnd, Math.max(0, dragRef.current.origStartIdx + deltaMonths));
      } else {
        newEnd = Math.max(newStart, Math.min(months.length - 1, dragRef.current.origEndIdx + deltaMonths));
      }
      setItemState(prev => prev.map(it => it.id !== dragRef.current!.id ? it : ({
        ...it,
        start: ymFromIndex(newStart),
        end: ymFromIndex(newEnd),
      })));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [positioned, months]);

  // Corner (height) resize
  const cornerRef = useRef<{ id: string; startX: number; startY: number; origHeight: number; origEndIdx: number } | null>(null);
  const onBarCornerMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const found = positioned.find(p => p.id === id);
    if (!found) return;
    cornerRef.current = { id, startX: e.clientX, startY: e.clientY, origHeight: found.heightPx ?? 32, origEndIdx: found.endIdx };
    const onMove = (ev: MouseEvent) => {
      if (!cornerRef.current) return;
      const dy = ev.clientY - cornerRef.current.startY;
      const dx = ev.clientX - cornerRef.current.startX;
      const nextH = Math.max(20, Math.min(96, Math.round(cornerRef.current.origHeight + dy)));
      const deltaMonths = Math.round(dx / MONTH_CELL_WIDTH_PX);
      const newEnd = Math.max(0, Math.min(months.length - 1, cornerRef.current.origEndIdx + deltaMonths));
      setItemState(prev => prev.map(it => it.id !== cornerRef.current!.id ? it : ({
        ...it,
        heightPx: nextH,
        end: ymFromIndex(newEnd),
      })));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cornerRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [positioned]);

  // Sticky width resizer
  const stickyResizeStart = useRef<number | null>(null);
  const onStickyResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    stickyResizeStart.current = e.clientX;
    const startWidth = leftWidth;
    const onMove = (ev: MouseEvent) => {
      if (stickyResizeStart.current == null) return;
      const dx = ev.clientX - stickyResizeStart.current;
      const next = Math.min(460, Math.max(180, startWidth + dx));
      setLeftWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      stickyResizeStart.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth]);

  // Diagonal resize for sticky (width + height per-category)
  const stickyCornerRef = useRef<{ cat: string; startX: number; startY: number; origWidth: number; origHeightExtra: number } | null>(null);
  const onStickyCornerMouseDown = useCallback((e: React.MouseEvent, cat: string, baseHeight: number) => {
    e.preventDefault();
    stickyCornerRef.current = {
      cat,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: leftWidth,
      origHeightExtra: categoryHeights[cat] || 0,
    };
    const onMove = (ev: MouseEvent) => {
      if (!stickyCornerRef.current) return;
      const dx = ev.clientX - stickyCornerRef.current.startX;
      const dy = ev.clientY - stickyCornerRef.current.startY;
      const nextW = Math.min(520, Math.max(180, stickyCornerRef.current.origWidth + dx));
      setLeftWidth(nextW);
      const nextExtra = Math.max(0, Math.min(300, Math.round(stickyCornerRef.current.origHeightExtra + dy)));
      setCategoryHeights(prev => ({ ...prev, [stickyCornerRef.current!.cat]: nextExtra }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      stickyCornerRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth, categoryHeights]);

  return (
    <div className="overflow-visible bg-transparent" ref={containerRef}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${contentMinWidth}px` }}>
      {/* Quarter header */}
      <div
        className="grid text-[12px] text-foreground/70"
        style={{ gridTemplateColumns: `${leftColWidth}px repeat(${months.length}, ${MONTH_CELL_WIDTH_PX}px)` }}
      >
        {/* Quarter row */}
        <div />
        {quarters.map((q) => (
          <div
            key={q.label}
            className="flex items-center justify-center py-2 font-medium"
            style={{ gridColumn: `${q.startIndex + 2} / span ${q.span}` }}
          >
            {q.label}
          </div>
        ))}
        {/* Separator under quarter row */}
        <div className="col-span-full border-b border-border" />
        {/* Month row */}
        <div />
        {months.map((m) => (
          <div key={m.key} className="px-2 py-2 text-center text-foreground/80">
            {m.label}
          </div>
        ))}
        {/* Separator under month row */}
        <div className="col-span-full border-b border-border" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {categories.map((cat) => (
          <div key={cat}
            className="grid items-stretch"
            style={{ gridTemplateColumns: `${leftColWidth}px repeat(${months.length}, ${MONTH_CELL_WIDTH_PX}px)` }}
          >
            {/* Sticky-note style category cell */}
            <div className="relative px-5 text-sm font-semibold uppercase tracking-wide text-foreground/80 select-none"
                 style={{ paddingTop: '24px', paddingBottom: '24px' }}>
              <div className="relative border border-border/80 rounded-sm shadow-sm px-7 bg-[#EBE4DF] flex items-center justify-center text-center"
                   style={{ minHeight: `${64 + (categoryHeights[cat] || 0)}px` }}>
                <span className="leading-none">{cat}</span>
                {/* dog-ear fold */}
                <span className="absolute -bottom-px -right-px w-0 h-0 border-l-[22px] border-l-transparent border-t-[22px] border-t-border/20" />
                <span className="absolute -bottom-px -right-px w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] translate-x-[-2px] translate-y-[-2px]" style={{ borderTopColor: '#EBE4DF' }} />
                {/* width drag handle */}
                <span onMouseDown={onStickyResizeMouseDown} className="absolute top-1/2 -right-2 translate-y-[-50%] w-2 h-8 cursor-col-resize bg-border/60 rounded-sm" />
                {/* corner drag (width + height) */}
                <span onMouseDown={(e) => onStickyCornerMouseDown(e, cat, 0)} className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize" />
              </div>
            </div>
            {/* Timeline grid */}
            {months.map((m, idx) => (
              <div key={`${cat}-${m.key}`} className={`relative z-0 border-l ${idx === months.length - 1 ? 'border-r' : ''} border-border`}>
                {/* vertical grid lines */}
              </div>
            ))}
            {/* Bars layer (absolute, span across months area) */}
            <div className="col-span-1" />
            <div className="relative col-span-[var(--span)]" style={{ gridColumn: `span ${months.length} / span ${months.length}` }}>
              {/* Bars for this category */}
              <div className="absolute inset-0 z-10">
                {(() => {
                  const catItems = positioned.filter((it) => it.category === cat);
                  const spacing = 1.5; // small gap between stacked cards
                  const tops: number[] = [];
                  let acc = 12; // initial top offset
                  for (let i = 0; i < catItems.length; i++) {
                    tops[i] = acc;
                    acc += (catItems[i].heightPx ?? 32) + spacing;
                  }
                  const totalHeight = acc; // used to set row spacer below
                  return (
                    <>
                      {catItems.map((it, i) => (
                  <div
                    key={it.id}
                    title={`${it.label}: ${it.start} → ${it.end}`}
                    className="group absolute rounded-md border border-border/60 shadow-sm cursor-pointer"
                    style={{
                      left: `${it.left}%`,
                      width: `${it.width}%`,
                      top: `${tops[i]}px`,
                      background: it.color,
                      height: `${it.heightPx ?? 32}px`,
                    }}
                  >
                    {editing?.id === it.id ? (
                      <input
                        className="absolute inset-0 w-full h-full bg-transparent px-3 text-[12px] outline-none"
                        value={editing.text}
                        onChange={(e) => setEditing({ id: it.id, text: e.target.value })}
                        onBlur={() => { setItemState(prev => prev.map(p => p.id !== it.id ? p : ({ ...p, label: editing.text }))); setEditing(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') setEditing(null); }}
                        autoFocus
                      />
                    ) : (
                      <div className="px-3 text-[12px] h-full flex items-center text-foreground/90 truncate">{it.label}</div>
                    )}
                    {/* subtle curved corner indicator */}
                    <span className="pointer-events-none absolute right-1.5 bottom-1.5 block w-3 h-3 rounded-br-sm border-r border-b border-foreground/30 opacity-80" />
                    {/* hover actions overlayed on the bar */}
                    <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-1 rounded bg-white/80 px-1 py-0.5 shadow-sm">
                      <button
                        className="p-0.5 hover:opacity-80"
                        title="Edit"
                        aria-label="Edit"
                        onClick={() => setEditing({ id: it.id, text: it.label })}
                      >
                        <Pencil className="h-3 w-3 text-foreground/80" />
                      </button>
                      <button
                        className="p-0.5 hover:opacity-80"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => setItemState(prev => prev.filter(p => p.id !== it.id))}
                      >
                        <Trash2 className="h-3 w-3 text-foreground/80" />
                      </button>
                      <button
                        className="p-0.5 hover:opacity-80"
                        title="View"
                        aria-label="View"
                        onClick={() => alert(`${it.label}\n${it.start} → ${it.end}`)}
                      >
                        <Eye className="h-3 w-3 text-foreground/80" />
                      </button>
                    </div>
                    {/* resize handles */}
                    <span onMouseDown={(e) => onBarHandleMouseDown(e, it.id, 'left')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize" />
                    <span onMouseDown={(e) => onBarHandleMouseDown(e, it.id, 'right')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize" />
                    <span onMouseDown={(e) => onBarCornerMouseDown(e, it.id)} className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize" />
                  </div>
                      ))}
                      {/* Row spacer height based on total stacked height */}
                      <div style={{ height: `${totalHeight}px` }} />
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Filler grid to extend lines to the bottom of the viewport */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `${leftColWidth}px repeat(${months.length}, ${MONTH_CELL_WIDTH_PX}px)` }}
      >
        <div />
        {months.map((m, idx) => (
          <div
            key={`filler-${m.key}`}
            className={`border-l ${idx === months.length - 1 ? 'border-r' : ''} border-b border-border h-[30vh]`}
          />
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyTimeline;



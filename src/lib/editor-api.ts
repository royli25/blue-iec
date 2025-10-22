import type { Editor } from "@tiptap/react";

export type Operation =
  | { type: 'insert_at_cursor'; contentMd: string }
  | { type: 'replace_selection'; contentMd: string }
  | { type: 'append_section'; heading: string; contentMd: string }
  | { type: 'append_under_heading'; parent: string; heading: string; contentMd: string }
  | { type: 'replace_heading_section'; heading: string; contentMd: string }
  | { type: 'format_range'; style: 'bold'|'italic'|'list'|'h1'|'h2'|'h3' }
  | { type: 'noop'; reason?: string };

export interface EditorAPI {
  getDocJson: () => any;
  setDocJson: (doc: any) => void;
  insertMarkdownAtCursor: (md: string) => void;
  replaceSelectionWithMarkdown: (md: string) => void;
  appendSection: (heading: string, md: string) => void;
  appendUnderHeading: (parent: string, heading: string, md: string) => void;
  replaceHeadingSection: (heading: string, md: string) => void;
}

export function createEditorAPI(editor: Editor): EditorAPI {
  const inlineMdToTextNodes = (md: string): any[] => {
    const nodes: any[] = [];
    if (!md) return nodes;
    // Handle inline code `code`
    const codeSplit = md.split(/(`[^`]+`)/g);
    for (const seg of codeSplit) {
      if (!seg) continue;
      if (seg.startsWith('`') && seg.endsWith('`')) {
        nodes.push({ type: 'text', text: seg.slice(1, -1), marks: [{ type: 'code' }] });
        continue;
      }
      // Handle bold **text** and italic *text*
      let rest = seg;
      const strongRegex = /\*\*([^*]+)\*\*/g;
      let lastIndex = 0; let m: RegExpExecArray | null;
      while ((m = strongRegex.exec(seg)) !== null) {
        if (m.index > lastIndex) {
          nodes.push({ type: 'text', text: seg.slice(lastIndex, m.index) });
        }
        nodes.push({ type: 'text', text: m[1], marks: [{ type: 'bold' }] });
        lastIndex = m.index + m[0].length;
      }
        if (lastIndex < seg.length) {
        rest = seg.slice(lastIndex);
        // simple italic
        const italicRegex = /\*([^*]+)\*/g;
        let lastI = 0; let mi: RegExpExecArray | null;
        while ((mi = italicRegex.exec(rest)) !== null) {
          if (mi.index > lastI) {
            nodes.push({ type: 'text', text: rest.slice(lastI, mi.index) });
          }
          nodes.push({ type: 'text', text: mi[1], marks: [{ type: 'italic' }] });
          lastI = mi.index + mi[0].length;
        }
        if (lastI < rest.length) nodes.push({ type: 'text', text: rest.slice(lastI) });
      }
    }
    return nodes.length ? nodes : [{ type: 'text', text: md }];
  };

  const mdToNodes = (markdown: string): any[] => {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const nodes: any[] = [];
    for (const line of lines) {
      if (line.startsWith('### ')) {
        nodes.push({ type: 'heading', attrs: { level: 3 }, content: inlineMdToTextNodes(line.substring(4)) });
      } else if (line.startsWith('## ')) {
        nodes.push({ type: 'heading', attrs: { level: 2 }, content: inlineMdToTextNodes(line.substring(3)) });
      } else if (line.startsWith('# ')) {
        nodes.push({ type: 'heading', attrs: { level: 1 }, content: inlineMdToTextNodes(line.substring(2)) });
      } else if (line.trim().startsWith('- ')) {
        // simple bullet list by grouping consecutive - items
        const item = line.trim().slice(2);
        // if previous is bulletList, append; else create
        const prev = nodes[nodes.length - 1];
        if (prev && prev.type === 'bulletList') {
          prev.content.push({ type: 'listItem', content: [{ type: 'paragraph', content: inlineMdToTextNodes(item) }] });
        } else {
          nodes.push({ type: 'bulletList', content: [ { type: 'listItem', content: [{ type: 'paragraph', content: inlineMdToTextNodes(item) }] } ] });
        }
      } else if (line.trim()) {
        nodes.push({ type: 'paragraph', content: inlineMdToTextNodes(line) });
      }
    }
    return nodes;
  };

  // expose helper to other modules via attached property
  (createEditorAPI as any)._mdToNodes = mdToNodes;

  const getDocJson = () => editor.getJSON();
  const setDocJson = (doc: any) => editor.commands.setContent(doc);
  const insertMarkdownAtCursor = (md: string) => editor.chain().focus().insertContent({ type: 'doc', content: mdToNodes(md) }).run();
  const replaceSelectionWithMarkdown = (md: string) => editor.chain().focus().insertContent(mdToNodes(md)).run();

  const appendSection = (heading: string, md: string) => {
    const nodes = [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: heading }] },
      ...mdToNodes(md),
    ];
    editor.chain().focus().insertContent(nodes).run();
  };

  const findHeadingRange = (headingText: string) => {
    const json = editor.getJSON();
    const content = json.content || [];
    let startIndex = -1;
    let endIndex = content.length;
    let level = 2;
    for (let i = 0; i < content.length; i++) {
      const node = content[i];
      if (node.type === 'heading') {
        const txt = (node.content || []).map((c: any) => c.text || '').join('');
        if (startIndex === -1 && txt.trim() === headingText.trim()) {
          startIndex = i;
          level = node.attrs?.level ?? 2;
          continue;
        }
        if (startIndex !== -1 && (node.attrs?.level ?? 3) <= level) { endIndex = i; break; }
      }
    }
    return { startIndex, endIndex } as { startIndex: number; endIndex: number };
  };

  const appendUnderHeading = (parent: string, heading: string, md: string) => {
    const json = editor.getJSON();
    const content = json.content || [];
    const { startIndex, endIndex } = findHeadingRange(parent);
    const nodes = [
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: heading }] },
      ...mdToNodes(md),
    ];
    if (startIndex === -1) {
      // parent not found; fallback to append at end
      editor.chain().focus().insertContent(nodes).run();
      return;
    }
    const before = content.slice(0, endIndex);
    const after = content.slice(endIndex);
    const next = { ...json, content: [...before, ...nodes, ...after] };
    editor.commands.setContent(next);
  };

  const replaceHeadingSection = (heading: string, md: string) => {
    const json = editor.getJSON();
    const content = json.content || [];
    let startIndex = -1;
    let endIndex = content.length;
    for (let i = 0; i < content.length; i++) {
      const node = content[i];
      const headingText = (node.type === 'heading')
        ? (node.content || []).map((c: any) => c.text || '').join('').trim()
        : '';
      if (node.type === 'heading' && headingText === heading.trim()) {
        startIndex = i + 1; // content after heading
        const level = node.attrs?.level ?? 2;
        // find next heading of same or higher level
        for (let j = startIndex; j < content.length; j++) {
          const n = content[j];
          if (n.type === 'heading' && (n.attrs?.level ?? 3) <= level) { endIndex = j; break; }
        }
        break;
      }
    }
    if (startIndex === -1) {
      // heading not found; append new section
      appendSection(heading, md);
      return;
    }
    const before = content.slice(0, startIndex);
    const after = content.slice(endIndex);
    const replacement = mdToNodes(md);
    const next = { ...json, content: [...before, ...replacement, ...after] };
    editor.commands.setContent(next);
  };

  return { getDocJson, setDocJson, insertMarkdownAtCursor, replaceSelectionWithMarkdown, appendSection, appendUnderHeading, replaceHeadingSection };
}

export function markdownStringToDoc(markdown: string): any {
  const mdToNodes = (createEditorAPI as any)._mdToNodes as (md: string) => any[];
  const content = mdToNodes ? mdToNodes(markdown) : [];
  return { type: 'doc', content };
}

export function jsonToPlainMarkdown(doc: any): string {
  const out: string[] = [];
  const walk = (nodes: any[] = []) => {
    for (const n of nodes) {
      if (n.type === 'heading') {
        const level = n.attrs?.level ?? 2;
        const text = n.content?.map((c: any) => c.text || '').join('') || '';
        out.push(`${'#'.repeat(level)} ${text}`);
      } else if (n.type === 'paragraph') {
        const text = n.content?.map((c: any) => c.text || '').join('') || '';
        if (text.trim()) out.push(text);
      } else if (n.type === 'bulletList') {
        for (const li of n.content || []) {
          const text = (li.content?.[0]?.content || []).map((c: any) => c.text || '').join('');
          out.push(`- ${text}`);
        }
      } else if (n.content) {
        walk(n.content);
      }
    }
  };
  walk(doc?.content || []);
  return out.join('\n');
}

export function applyOperations(editor: Editor, ops: Operation[]) {
  const api = createEditorAPI(editor);
  for (const op of ops) {
    if (op.type === 'insert_at_cursor') api.insertMarkdownAtCursor(op.contentMd);
    else if (op.type === 'replace_selection') api.replaceSelectionWithMarkdown(op.contentMd);
    else if (op.type === 'append_section') api.appendSection(op.heading, op.contentMd);
    else if (op.type === 'append_under_heading') api.appendUnderHeading(op.parent, op.heading, op.contentMd);
    else if (op.type === 'replace_heading_section') api.replaceHeadingSection(op.heading, op.contentMd);
    else if (op.type === 'format_range') {
      const chain = editor.chain().focus();
      switch (op.style) {
        case 'bold': chain.toggleBold().run(); break;
        case 'italic': chain.toggleItalic().run(); break;
        case 'list': chain.toggleBulletList().run(); break;
        case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
        case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
        case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
      }
    }
  }
}



// A minimal Markdown to HTML renderer for chat responses.
// Supports: H1-H3 headings, ordered/unordered lists, paragraphs,
// bold, italic, inline code, and links. Escapes HTML by default.

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]
  );
}

function renderInline(md: string, linkifyProfiles = false): string {
  let text = escapeHtml(md);
  
  // Convert student profile references to clickable links
  // Matches: **Student Profile N (Name)** at start of line
  if (linkifyProfiles) {
    text = text.replace(/\*\*Student Profile \d+ \(([^)]+)\)\*\*/g, (match, name) => {
      const encodedName = encodeURIComponent(name);
      return `<a href="/admitted-profiles?profile=${encodedName}" class="profile-link font-semibold text-blue-700 hover:text-blue-800 hover:underline">${match.replace(/\*\*/g, '')}</a>`;
    });
  }
  
  // links: [text](http...) or [text](/path)
  text = text.replace(/\[([^\]]+)\]\(((?:https?:|\/)[^)]+)\)/g, (match, linkText, url) => {
    // Internal links (starting with /) should not open in new tab
    if (url.startsWith('/')) {
      return `<a href="${url}" class="profile-link font-semibold text-blue-700 hover:text-blue-800 hover:underline">${linkText}<\/a>`;
    }
    // External links (http/https) open in new tab
    return `<a href="${url}" target="_blank" rel="noreferrer">${linkText}<\/a>`;
  });
  // autolink bare URLs (http/https or www.)
  text = text.replace(/(^|[\s(])((https?:\/\/|www\.)[^\s)]+)(?=$|[\s)])/g, (_m, pre: string, url: string) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `${pre}<a href="${href}" target="_blank" rel="noreferrer">${url}<\/a>`;
  });
  // bold: **text** (skip if already processed as profile link)
  if (!linkifyProfiles) {
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
  } else {
    // Only boldify if not a student profile reference
    text = text.replace(/\*\*(?!Student Profile \d+)([^*]+)\*\*/g, '<strong>$1<\/strong>');
  }
  // inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1<\/code>');
  // italic: *text* (not part of bold)
  text = text.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1<em>$2<\/em>');
  return text;
}

export function renderMarkdownToHtml(markdown: string, linkifyProfiles = false): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  // Top-level list states
  let inUl = false;
  let inOl = false;
  // Ordered-list item grouping state (to group following bullets/paragraphs)
  let inOlLi = false;
  let inNestedUl = false;

  const closeNestedUl = () => {
    if (inNestedUl) { html += '<\/ul>'; inNestedUl = false; }
  };

  const closeOlLi = () => {
    if (inOlLi) {
      closeNestedUl();
      html += '<\/li>';
      inOlLi = false;
    }
  };

  const closeAllLists = () => {
    // Close any open ordered-list item first
    closeOlLi();
    if (inUl) { html += '<\/ul>'; inUl = false; }
    if (inOl) { html += '<\/ol>'; inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');

    // headings
    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      closeAllLists();
      const level = heading[0].startsWith('###') ? 3 : heading[0].startsWith('##') ? 2 : 1;
      html += `<h${level}>${renderInline(heading[1], linkifyProfiles)}<\/h${level}>`;
      continue;
    }

    // ordered list (start or continue)
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      // If we're switching from top-level UL, close it first
      if (!inOl) { closeAllLists(); html += '<ol>'; inOl = true; }
      // Close previous LI if any
      closeOlLi();
      // Open new LI and keep it open to group following lines
      html += `<li><div>${renderInline(ordered[1], linkifyProfiles)}<\/div>`;
      inOlLi = true;
      continue;
    }

    // unordered list
    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    if (unordered) {
      // If we are inside an open ordered-list item, treat this as a nested UL
      if (inOl && inOlLi) {
        if (!inNestedUl) { html += '<ul>'; inNestedUl = true; }
        html += `<li>${renderInline(unordered[1], linkifyProfiles)}<\/li>`;
        continue;
      }
      // Otherwise, it's a top-level UL
      if (!inUl) { closeAllLists(); html += '<ul>'; inUl = true; }
      html += `<li>${renderInline(unordered[1], linkifyProfiles)}<\/li>`;
      continue;
    }

    // Blank lines: keep lists open so following content can still attach
    if (line.trim() === '') {
      // Do not force-close ordered-list item; allow grouping paragraphs
      if (inUl || inOl) { continue; }
      continue;
    }

    // Regular paragraph lines
    if (inOl && inOlLi) {
      // Paragraph inside an ordered-list item
      html += `<p>${renderInline(line, linkifyProfiles)}<\/p>`;
      continue;
    }

    // Outside of any OL item
    closeAllLists();
    html += `<p>${renderInline(line, linkifyProfiles)}<\/p>`;
  }

  closeAllLists();
  return html;
}

export default renderMarkdownToHtml;



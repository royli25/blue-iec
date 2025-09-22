// A minimal Markdown to HTML renderer for chat responses.
// Supports: H1-H3 headings, ordered/unordered lists, paragraphs,
// bold, italic, inline code, and links. Escapes HTML by default.

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]
  );
}

function renderInline(md: string): string {
  let text = escapeHtml(md);
  // links: [text](http...)
  text = text.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1<\/a>');
  // autolink bare URLs (http/https or www.)
  text = text.replace(/(^|[\s(])((https?:\/\/|www\.)[^\s)]+)(?=$|[\s)])/g, (_m, pre: string, url: string) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `${pre}<a href="${href}" target="_blank" rel="noreferrer">${url}<\/a>`;
  });
  // bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
  // inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1<\/code>');
  // italic: *text* (not part of bold)
  text = text.replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1<em>$2<\/em>');
  return text;
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { html += '<\/ul>'; inUl = false; }
    if (inOl) { html += '<\/ol>'; inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');

    // headings
    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      closeLists();
      const level = heading[0].startsWith('###') ? 3 : heading[0].startsWith('##') ? 2 : 1;
      html += `<h${level}>${renderInline(heading[1])}<\/h${level}>`;
      continue;
    }

    // ordered list
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ordered) {
      if (!inOl) { closeLists(); html += '<ol>'; inOl = true; }
      html += `<li>${renderInline(ordered[1])}<\/li>`;
      continue;
    }

    // unordered list
    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    if (unordered) {
      if (!inUl) { closeLists(); html += '<ul>'; inUl = true; }
      html += `<li>${renderInline(unordered[1])}<\/li>`;
      continue;
    }

    // Blank lines: do not close lists; allow spacing between list items
    if (line.trim() === '') {
      if (inUl || inOl) { continue; }
      continue;
    }

    closeLists();
    html += `<p>${renderInline(line)}<\/p>`;
  }

  closeLists();
  return html;
}

export default renderMarkdownToHtml;



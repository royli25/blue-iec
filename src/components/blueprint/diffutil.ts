type Part = { value: string; added?: boolean; removed?: boolean };

// Minimal line diff: compares line-by-line; if different, marks removal and addition.
export function diffLines(a: string, b: string): Part[] {
  const aLines = a.replace(/\r\n?/g, '\n').split('\n');
  const bLines = b.replace(/\r\n?/g, '\n').split('\n');
  const maxLen = Math.max(aLines.length, bLines.length);
  const parts: Part[] = [];
  for (let i = 0; i < maxLen; i++) {
    const av = aLines[i];
    const bv = bLines[i];
    if (av === undefined && bv !== undefined) {
      parts.push({ value: bv + '\n', added: true });
    } else if (bv === undefined && av !== undefined) {
      parts.push({ value: av + '\n', removed: true });
    } else if (av === bv) {
      parts.push({ value: (av ?? '') + '\n' });
    } else {
      if (av !== undefined) parts.push({ value: av + '\n', removed: true });
      if (bv !== undefined) parts.push({ value: bv + '\n', added: true });
    }
  }
  return parts;
}



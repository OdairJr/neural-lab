export interface MarkdownDocument {
  /** Parsed YAML-ish frontmatter key/value pairs (all strings). */
  frontmatter: Record<string, string>;
  /** Markdown body with the frontmatter block removed. */
  body: string;
}

/**
 * Splits an optional leading frontmatter block (`--- ... ---`) from the
 * markdown body. Only simple `key: value` pairs are supported.
 */
export function parseFrontmatter(raw: string): MarkdownDocument {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, body: normalized };
  }

  const endIndex = normalized.indexOf('\n---', 4);
  if (endIndex === -1) {
    return { frontmatter: {}, body: normalized };
  }

  const frontmatter: Record<string, string> = {};
  for (const line of normalized.slice(4, endIndex).split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) {
      frontmatter[key] = value;
    }
  }

  const bodyStart = normalized.indexOf('\n', endIndex + 1);
  return {
    frontmatter,
    body: bodyStart === -1 ? '' : normalized.slice(bodyStart + 1),
  };
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text so it can be safely embedded in generated HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

function renderInline(text: string): string {
  let html = escapeHtml(text);
  // Inline code first so its content is not further interpreted.
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
  return html;
}

/**
 * Minimal, dependency-free markdown renderer supporting headings, bold/italic,
 * inline code, links, ordered/unordered lists and paragraphs.
 *
 * The output is escaped before inline formatting, so `[innerHTML]` can render
 * it without exposing raw user content.
 */
export function renderMarkdown(raw: string): string {
  const { body } = parseFrontmatter(raw);
  const lines = body.split('\n');
  const html: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const closeList = (): void => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const openList = (type: 'ul' | 'ol'): void => {
    if (listType !== type) {
      closeList();
      html.push(`<${type}>`);
      listType = type;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(trimmed);
    if (unordered) {
      flushParagraph();
      openList('ul');
      html.push(`<li>${renderInline(unordered[1])}</li>`);
      continue;
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (ordered) {
      flushParagraph();
      openList('ol');
      html.push(`<li>${renderInline(ordered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  return html.join('\n');
}

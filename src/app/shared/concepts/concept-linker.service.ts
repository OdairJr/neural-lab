import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ConceptRegistry } from './concept-registry.service';

// `whatToShow` and filter return values from the DOM spec, used directly so the
// service works in environments where the `NodeFilter` global is missing.
const SHOW_TEXT = 4;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;

/** Tags whose text must never be turned into a glossary link. */
const EXCLUDED_SELECTOR = 'code, pre, a';

const REGEXP_ESCAPE = /[.*+?^${}()|[\]\\]/g;

function escapeRegExp(value: string): string {
  return value.replace(REGEXP_ESCAPE, '\\$&');
}

/** URL prefix of the inline concept links produced by the linker. */
export const CONCEPT_LINK_PREFIX = '#/glossario?concept=';

/**
 * Extracts the concept id from an inline concept link.
 *
 * The click handler keys off `href` (not a `data-*` attribute) because Angular's
 * `[innerHTML]` sanitizer strips unknown `data-*` attributes while preserving
 * the URL.
 */
export function conceptIdFromHref(href: string | null | undefined): string | null {
  if (!href || !href.startsWith(CONCEPT_LINK_PREFIX)) {
    return null;
  }
  const id = href.slice(CONCEPT_LINK_PREFIX.length);
  if (!id) {
    return null;
  }
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/**
 * Turns known concept titles inside rendered lab HTML into glossary links.
 *
 * The HTML produced by `renderMarkdown` is parsed, its text nodes are matched
 * against the registered concept titles (longest title first, on word
 * boundaries) and each match becomes an `<a data-concept="…">` anchor. Text
 * inside `<code>`, `<pre>` or an existing `<a>` is left untouched, so inline
 * code samples and authored links are never double-linked.
 */
@Injectable({ providedIn: 'root' })
export class ConceptLinkerService {
  private readonly document = inject(DOCUMENT);
  private readonly registry = inject(ConceptRegistry);

  /** Returns `html` with the first occurrence of every known term linked. */
  linkify(html: string): string {
    if (!html) {
      return html;
    }

    const entries = this.registry
      .all()
      .map((concept) => ({ title: concept.title, id: concept.id }))
      .filter((entry) => entry.title.trim().length > 0)
      .sort((a, b) => b.title.length - a.title.length);

    if (entries.length === 0) {
      return html;
    }

    const byTitle = new Map(entries.map((entry) => [entry.title.toLowerCase(), entry.id]));
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])(?:${entries.map((entry) => escapeRegExp(entry.title)).join('|')})(?![\\p{L}\\p{N}])`,
      'giu',
    );

    const template = this.document.createElement('template');
    template.innerHTML = html;
    this.linkTextNodes(template.content, pattern, byTitle);
    return template.innerHTML;
  }

  private linkTextNodes(
    root: DocumentFragment,
    pattern: RegExp,
    byTitle: ReadonlyMap<string, string>,
  ): void {
    const walker = this.document.createTreeWalker(root, SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = (node as Text).parentElement;
        if (!parent || parent.closest(EXCLUDED_SELECTOR)) {
          return FILTER_REJECT;
        }
        return FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      textNodes.push(node as Text);
      node = walker.nextNode();
    }

    for (const textNode of textNodes) {
      this.linkTextNode(textNode, pattern, byTitle);
    }
  }

  private linkTextNode(
    textNode: Text,
    pattern: RegExp,
    byTitle: ReadonlyMap<string, string>,
  ): void {
    const text = textNode.data;
    const document = this.document;
    const fragment = document.createDocumentFragment();

    pattern.lastIndex = 0;
    let lastIndex = 0;
    let linked = false;
    let match = pattern.exec(text);

    while (match !== null) {
      const conceptId = byTitle.get(match[0].toLowerCase());
      if (conceptId) {
        linked = true;
        if (match.index > lastIndex) {
          fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const anchor = document.createElement('a');
        anchor.setAttribute('data-concept', conceptId);
        anchor.setAttribute('href', `${CONCEPT_LINK_PREFIX}${encodeURIComponent(conceptId)}`);
        anchor.textContent = match[0];
        fragment.append(anchor);
        lastIndex = match.index + match[0].length;
      }
      match = pattern.exec(text);
    }

    if (!linked) {
      return;
    }

    if (lastIndex < text.length) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.replaceWith(fragment);
  }
}

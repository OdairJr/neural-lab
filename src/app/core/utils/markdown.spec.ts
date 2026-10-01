import { escapeHtml, parseFrontmatter, renderMarkdown } from './markdown';

describe('parseFrontmatter', () => {
  it('extracts simple key/value frontmatter', () => {
    const doc = parseFrontmatter('---\ntitle: Tensores\norder: 1\n---\n# Corpo');

    expect(doc.frontmatter).toEqual({ title: 'Tensores', order: '1' });
    expect(doc.body.trim()).toBe('# Corpo');
  });

  it('returns the whole document when there is no frontmatter', () => {
    const doc = parseFrontmatter('# Sem frontmatter');

    expect(doc.frontmatter).toEqual({});
    expect(doc.body).toBe('# Sem frontmatter');
  });
});

describe('escapeHtml', () => {
  it('escapes angle brackets and quotes', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });
});

describe('renderMarkdown', () => {
  it('renders headings, bold and inline code', () => {
    const html = renderMarkdown('# Título\n\nTexto **forte** e `código`.');

    expect(html).toContain('<h1>Título</h1>');
    expect(html).toContain('<strong>forte</strong>');
    expect(html).toContain('<code>código</code>');
  });

  it('renders ordered and unordered lists', () => {
    const html = renderMarkdown('- um\n- dois\n\n1. primeiro\n2. segundo');

    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>primeiro</li>');
  });

  it('escapes raw HTML to prevent injection', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)>');

    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('only linkifies http(s) URLs', () => {
    const html = renderMarkdown('[ok](https://example.com) [x](javascript:alert(1))');

    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain('href="javascript:');
  });
});

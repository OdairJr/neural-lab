import { TestBed } from '@angular/core/testing';
import type { Concept } from '@domain/content';
import { ConceptRegistry } from './concept-registry.service';
import { ConceptLinkerService } from './concept-linker.service';

function concept(id: string, title: string): Concept {
  return {
    id,
    title,
    shortDefinition: title,
    fullDefinition: title,
    tfjsApi: [],
    relatedConcepts: [],
    introducedInLab: '',
  };
}

describe('ConceptLinkerService', () => {
  let linker: ConceptLinkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(ConceptRegistry);
    registry.clear();
    registry.registerMany([
      concept('tensor', 'Tensor'),
      concept('soma', 'Soma'),
      concept('soma-ponderada', 'Soma ponderada'),
      concept('mse', 'MSE'),
    ]);
    linker = TestBed.inject(ConceptLinkerService);
  });

  it('links known concept titles on word boundaries', () => {
    const html = linker.linkify('<p>Um Tensor é um array.</p>');

    expect(html).toContain('data-concept="tensor"');
    expect(html).toContain('href="#/glossario?concept=tensor"');
    expect(html).toContain('>Tensor</a>');
  });

  it('matches titles case-insensitively', () => {
    expect(linker.linkify('<p>a sigla mse</p>')).toContain('data-concept="mse"');
  });

  it('does not link terms that are part of a longer word', () => {
    const html = linker.linkify('<p>Os tensores são arrays.</p>');

    expect(html).not.toContain('data-concept');
    expect(html).toBe('<p>Os tensores são arrays.</p>');
  });

  it('does not link inside inline code', () => {
    const html = linker.linkify('<p>Use <code>Tensor</code> aqui.</p>');

    expect(html).not.toContain('data-concept');
    expect(html).toContain('<code>Tensor</code>');
  });

  it('does not double-link terms inside existing anchors', () => {
    const html = linker.linkify('<p><a href="/x">Tensor</a> é legal</p>');

    expect(html).not.toContain('data-concept');
    expect(html).toBe('<p><a href="/x">Tensor</a> é legal</p>');
  });

  it('prefers the longest matching title', () => {
    const html = linker.linkify('<p>Soma ponderada do neurônio</p>');

    expect(html).toContain('data-concept="soma-ponderada"');
    expect(html).not.toContain('data-concept="soma"');
  });

  it('leaves unknown words untouched', () => {
    const html = linker.linkify('<p>Foo Bar baz</p>');

    expect(html).toBe('<p>Foo Bar baz</p>');
  });
});

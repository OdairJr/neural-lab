import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { StageConfig } from '@domain/content';
import { ConceptModalService, ConceptRegistry } from '@shared/concepts';
import type { LabRuntimeService } from '@shared/runtime/lab-runtime.service';
import { MarkdownStageComponent } from './markdown-stage.component';

const runtimeStub = {} as LabRuntimeService;

function configWith(content: string): StageConfig {
  return {
    type: 'contextualizacao',
    title: 'Contexto',
    component: 'markdown',
    config: { content },
  };
}

describe('MarkdownStageComponent glossary links', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MarkdownStageComponent] }).compileComponents();
    const registry = TestBed.inject(ConceptRegistry);
    registry.clear();
    registry.register({
      id: 'tensor',
      title: 'Tensor',
      shortDefinition: 'Array multidimensional.',
      fullDefinition: 'Um tensor é um array multidimensional de valores.',
      tfjsApi: [],
      relatedConcepts: [],
      introducedInLab: 'lab-01-tensors',
    });
    TestBed.inject(ConceptModalService).close();
  });

  function render(content: string) {
    const fixture = TestBed.createComponent(MarkdownStageComponent, {
      bindings: [
        inputBinding('config', () => configWith(content)),
        inputBinding('stageIndex', () => 0),
        inputBinding('runtime', () => runtimeStub),
      ],
    });
    fixture.detectChanges();
    return fixture;
  }

  it('turns known terms into concept anchors and opens the modal on click', () => {
    const fixture = render('Veja o Tensor com atenção.');
    const anchor = fixture.nativeElement.querySelector(
      'a[href="#/glossario?concept=tensor"]',
    ) as HTMLAnchorElement;
    expect(anchor).toBeTruthy();

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(TestBed.inject(ConceptModalService).selectedConceptId()).toBe('tensor');
  });

  it('ignores clicks on non-concept links', () => {
    const fixture = render('Leia [a documentação](https://example.com).');
    const anchor = fixture.nativeElement.querySelector(
      'a[href="https://example.com"]',
    ) as HTMLAnchorElement;
    expect(anchor).toBeTruthy();

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(TestBed.inject(ConceptModalService).selectedConceptId()).toBeNull();
  });
});

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { Concept } from '@domain/content';
import { ProgressService } from '@domain/progress';
import { ConceptRegistry } from '@shared/concepts';
import { GlossaryComponent } from './glossary.component';

const CONCEPTS: readonly Concept[] = [
  {
    id: 'tensor',
    title: 'Tensor',
    shortDefinition: 'Array multidimensional.',
    fullDefinition: 'Um tensor é um array multidimensional de valores.',
    tfjsApi: ['tf.tensor'],
    relatedConcepts: [],
    introducedInLab: 'lab-01-tensors',
  },
  {
    id: 'mse',
    title: 'MSE',
    shortDefinition: 'Erro quadrático médio.',
    fullDefinition: 'O MSE mede o erro médio ao quadrado entre predição e alvo.',
    tfjsApi: ['tf.losses.meanSquaredError'],
    relatedConcepts: [],
    introducedInLab: 'lab-09-linear-regression',
  },
  {
    id: 'gradiente',
    title: 'Gradiente',
    shortDefinition: 'Direção de maior crescimento.',
    fullDefinition: 'O gradiente aponta a direção de maior crescimento da perda.',
    tfjsApi: ['tf.grad'],
    relatedConcepts: ['mse'],
    introducedInLab: 'lab-10-gradient-descent',
  },
];

async function setup(url = '/glossario'): Promise<ComponentFixture<GlossaryComponent>> {
  await TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'glossario', component: GlossaryComponent }])],
  }).compileComponents();

  const registry = TestBed.inject(ConceptRegistry);
  registry.clear();
  registry.registerMany(CONCEPTS);
  TestBed.inject(ProgressService).reset();

  await TestBed.inject(Router).navigateByUrl(url);

  const fixture = TestBed.createComponent(GlossaryComponent);
  fixture.detectChanges();
  return fixture;
}

function termButtons(fixture: ComponentFixture<GlossaryComponent>): HTMLButtonElement[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll(
      'ul[aria-label="Termos do glossário"] button',
    ) as NodeListOf<HTMLButtonElement>,
  );
}

describe('GlossaryComponent', () => {
  it('lists every concept in alphabetical order', async () => {
    const fixture = await setup();
    const buttons = termButtons(fixture);

    expect(buttons).toHaveLength(CONCEPTS.length);
    expect(buttons[0].textContent).toContain('Gradiente');
    expect(buttons[2].textContent).toContain('Tensor');
  });

  it('filters the list in real time as the user searches', async () => {
    const fixture = await setup();
    const input = fixture.nativeElement.querySelector('#glossary-search') as HTMLInputElement;

    input.value = 'mse';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const buttons = termButtons(fixture);
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toContain('MSE');
  });

  it('opens the detail view when a term is selected', async () => {
    const fixture = await setup();
    const tensorButton = termButtons(fixture).find((button) =>
      button.textContent?.includes('Tensor'),
    ) as HTMLButtonElement;

    tensorButton.click();
    fixture.detectChanges();

    const detail = fixture.nativeElement.querySelector('app-concept-detail') as HTMLElement;
    expect(detail).toBeTruthy();
    expect(detail.textContent).toContain('Um tensor é um array multidimensional de valores.');
  });

  it('deep-links ?concept= and records the glossary view', async () => {
    const fixture = await setup('/glossario?concept=tensor');
    const progress = TestBed.inject(ProgressService);

    const detail = fixture.nativeElement.querySelector('app-concept-detail') as HTMLElement;
    expect(detail.textContent).toContain('Um tensor é um array multidimensional de valores.');
    expect(progress.progress().glossaryViews).toContain('tensor');

    const event = progress
      .analytics()
      .find((item) => item.eventType === 'glossary-viewed');
    expect(event?.payload).toEqual({ conceptId: 'tensor' });
  });
});

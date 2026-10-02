import { Component, inject, inputBinding, outputBinding } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import type { StageConfig } from '@domain/content';
import { ImageLoaderService } from '@core/images';
import { ProgressService } from '@domain/progress';
import { LabRuntimeService } from '@shared/runtime/lab-runtime.service';
import { ConceptRegistry } from '@shared/concepts/concept-registry.service';
import { ExperimentRegistry } from '@shared/experiments/experiment-registry';
import type { ExperimentFn } from '@shared/experiments';
import { MarkdownStageComponent } from './markdown-stage.component';
import { ConceptCardStageComponent } from './concept-card-stage.component';
import { VisualizationStageComponent } from './visualization-stage.component';
import { ChallengeStageComponent } from './challenge-stage.component';
import { ExperimentStageComponent } from './experiment-stage.component';
import type { StageCompletionEvent } from './stage-contract';

const ACCESSIBILITY = { ariaLabel: 'Viz', dataTableAlternative: true, colorBlindSafe: true };

const runtimeStub = {} as LabRuntimeService;

function markdownConfig(): StageConfig {
  return {
    type: 'contextualizacao',
    title: 'Contexto',
    component: 'markdown',
    config: { content: '# Olá\n\nBem-vindo ao laboratório.' },
  };
}

describe('MarkdownStageComponent', () => {
  it('renders markdown content and emits completion', async () => {
    const events: StageCompletionEvent[] = [];
    await TestBed.configureTestingModule({ imports: [MarkdownStageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(MarkdownStageComponent, {
      bindings: [
        inputBinding('config', markdownConfig),
        inputBinding('stageIndex', () => 0),
        inputBinding('runtime', () => runtimeStub),
        outputBinding<StageCompletionEvent>('stageComplete', (event) => events.push(event)),
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Olá');

    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element) =>
      element.textContent?.includes('Marcar etapa'),
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(events).toEqual([{ type: 'contextualizacao', index: 0 }]);
  });
});

describe('ConceptCardStageComponent', () => {
  it('renders a concept from the registry', async () => {
    await TestBed.configureTestingModule({ imports: [ConceptCardStageComponent] }).compileComponents();
    const registry = TestBed.inject(ConceptRegistry);
    registry.clear();
    registry.register({
      id: 'tensor',
      title: 'Tensor',
      shortDefinition: 'Array multidimensional.',
      fullDefinition: 'Um tensor é um array multidimensional de valores.',
      tfjsApi: ['tf.tensor'],
      relatedConcepts: [],
      introducedInLab: 'lab-01-tensors',
    });

    const config: StageConfig = {
      type: 'conceito',
      title: 'O que é um tensor',
      component: 'concept-card',
      config: { conceptId: 'tensor' },
    };

    const fixture = TestBed.createComponent(ConceptCardStageComponent, {
      bindings: [
        inputBinding('config', () => config),
        inputBinding('stageIndex', () => 0),
        inputBinding('runtime', () => runtimeStub),
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tensor');
    expect(fixture.nativeElement.textContent).toContain('Array multidimensional.');
  });

  it('shows a fallback for an unknown concept', async () => {
    await TestBed.configureTestingModule({ imports: [ConceptCardStageComponent] }).compileComponents();
    const registry = TestBed.inject(ConceptRegistry);
    registry.clear();

    const config: StageConfig = {
      type: 'conceito',
      title: 'Desconhecido',
      component: 'concept-card',
      config: { conceptId: 'does-not-exist' },
    };

    const fixture = TestBed.createComponent(ConceptCardStageComponent, {
      bindings: [
        inputBinding('config', () => config),
        inputBinding('stageIndex', () => 0),
        inputBinding('runtime', () => runtimeStub),
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('não foi definido');
  });
});

describe('VisualizationStageComponent', () => {
  it('renders the registered visualization component', async () => {
    const config: StageConfig = {
      type: 'exemplo-visual',
      title: 'Grade',
      component: 'visualization',
      config: {
        visualizationType: 'tensor-grid',
        initialData: {
          type: 'tensor-grid',
          tensor: {
            shape: [2],
            dtype: 'float32',
            values: [1, 2],
            size: 2,
            truncated: false,
            stats: { min: 1, max: 2, mean: 1.5, std: 0.5 },
          },
        },
      },
    };

    await TestBed.configureTestingModule({ imports: [VisualizationStageComponent] }).compileComponents();
    const fixture = TestBed.createComponent(VisualizationStageComponent, {
      bindings: [
        inputBinding('config', () => config),
        inputBinding('stageIndex', () => 0),
        inputBinding('runtime', () => runtimeStub),
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-tensor-grid')).toBeTruthy();
  });
});

function multipleChoiceConfig(): StageConfig {
  return {
    type: 'desafio',
    title: 'Escolha',
    component: 'challenge',
    validation: {
      type: 'multiple-choice',
      criteria: {
        options: [
          { id: 'a', label: 'Sigmoid' },
          { id: 'b', label: 'ReLU' },
        ],
        correctOptionIds: ['a'],
      },
      hints: ['Pense na curva em S.'],
    },
  };
}

async function renderChallenge(
  config: StageConfig,
  events: StageCompletionEvent[],
): Promise<ComponentFixture<ChallengeStageComponent>> {
  await TestBed.configureTestingModule({ imports: [ChallengeStageComponent] }).compileComponents();
  const fixture = TestBed.createComponent(ChallengeStageComponent, {
    bindings: [
      inputBinding('config', () => config),
      inputBinding('stageIndex', () => 3),
      inputBinding('runtime', () => runtimeStub),
      outputBinding<StageCompletionEvent>('stageComplete', (event) => events.push(event)),
    ],
  });
  fixture.detectChanges();
  return fixture;
}

function submitChallenge(fixture: ComponentFixture<ChallengeStageComponent>): void {
  const button = [...fixture.nativeElement.querySelectorAll('button')].find((element) =>
    element.textContent?.includes('Verificar resposta'),
  ) as HTMLButtonElement;
  button.click();
  fixture.detectChanges();
}

describe('ChallengeStageComponent', () => {
  it('emits stageComplete with success on a correct multiple-choice answer', async () => {
    const events: StageCompletionEvent[] = [];
    const fixture = await renderChallenge(multipleChoiceConfig(), events);

    const radio = fixture.nativeElement.querySelector(
      'input[value="a"]',
    ) as HTMLInputElement;
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    submitChallenge(fixture);

    expect(events).toEqual([{ type: 'desafio', index: 3, success: true }]);
  });

  it('does not complete and reveals a hint on a wrong answer', async () => {
    const events: StageCompletionEvent[] = [];
    const fixture = await renderChallenge(multipleChoiceConfig(), events);

    const radio = fixture.nativeElement.querySelector(
      'input[value="b"]',
    ) as HTMLInputElement;
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    submitChallenge(fixture);

    expect(events).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Pense na curva em S.');
  });

  it('accepts a string parameter-match target through a text input', async () => {
    const events: StageCompletionEvent[] = [];
    const config: StageConfig = {
      type: 'desafio',
      title: 'Normalização',
      component: 'challenge',
      validation: {
        type: 'parameter-match',
        criteria: { target: { normalization: 'signed' } },
      },
    };
    const fixture = await renderChallenge(config, events);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
    input.value = 'signed';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    submitChallenge(fixture);

    expect(events).toEqual([{ type: 'desafio', index: 3, success: true }]);
  });

  it('renders the code template and validates a code-output answer', async () => {
    const events: StageCompletionEvent[] = [];
    const config: StageConfig = {
      type: 'desafio',
      title: 'Conserte o vazamento',
      component: 'challenge',
      codeTemplate: [
        'const antes = tf.memory().numTensors;',
        'for (let i = 0; i < 100; i++) {',
        '  tf.tensor(new Float32Array(1000));',
        '}',
        'console.log("tensores restantes:", tf.memory().numTensors - antes);',
      ].join('\n'),
      validation: {
        type: 'code-output',
        prompt: 'Refatore com tf.tidy e informe a saída.',
        criteria: { expectedOutput: 'tensores restantes: 0' },
      },
    };
    const fixture = await renderChallenge(config, events);

    const codeBlock = fixture.nativeElement.querySelector('app-code-block');
    expect(codeBlock).toBeTruthy();
    expect(codeBlock.textContent).toContain('tf.tensor(new Float32Array(1000))');

    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'tensores restantes: 0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    submitChallenge(fixture);

    expect(events).toEqual([{ type: 'desafio', index: 3, success: true }]);
  });
});

describe('ExperimentStageComponent', () => {
  it('runs the experiment initially and after the debounced parameter change', async () => {
    vi.useFakeTimers();
    try {
      await TestBed.configureTestingModule({ imports: [ExperimentStageComponent] }).compileComponents();
      const registry = TestBed.inject(ExperimentRegistry);
      registry.clear();
      const experimentFn = vi.fn(() => ({
        visualizationData: {
          type: 'tensor-grid' as const,
          tensor: {
            shape: [1],
            dtype: 'float32',
            values: [1],
            size: 1,
            truncated: false,
            stats: { min: 1, max: 1, mean: 1, std: 0 },
          },
        },
      }));
      registry.register('exp', experimentFn);

      const setExperimentState = vi.fn();
      const runtime = {
        getExperimentState: vi.fn(() => undefined),
        setExperimentState,
        publishComputation: vi.fn(),
      } as unknown as LabRuntimeService;

      const events: StageCompletionEvent[] = [];
      const config: StageConfig = {
        type: 'experimentacao',
        title: 'Experimento',
        component: 'experiment',
        experimentConfig: {
          experimentFnId: 'exp',
          parameters: [{ name: 'w', type: 'number', label: 'Peso', min: 0, max: 10, defaultValue: 1 }],
          visualization: { type: 'tensor-grid', accessibility: ACCESSIBILITY },
        },
      };

      const fixture = TestBed.createComponent(ExperimentStageComponent, {
        bindings: [
          inputBinding('config', () => config),
          inputBinding('stageIndex', () => 5),
          inputBinding('runtime', () => runtime),
          outputBinding<StageCompletionEvent>('stageComplete', (event) => events.push(event)),
        ],
      });
      fixture.detectChanges();

      expect(experimentFn).toHaveBeenCalledTimes(1);
      expect(events).toHaveLength(1);

      const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
      input.value = '7';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      vi.advanceTimersByTime(150);
      fixture.detectChanges();

      expect(experimentFn).toHaveBeenCalledTimes(2);
      expect(setExperimentState).toHaveBeenCalled();
      expect(events).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders an image picker, loads the file and re-runs the experiment', async () => {
    vi.useFakeTimers();
    try {
      const sample = {
        name: 'exemplo-gradient',
        width: 2,
        height: 2,
        data: new Uint8ClampedArray(16),
      };
      const loaded = {
        name: 'foto.png',
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(64),
      };
      const loadFile = vi.fn(async () => loaded);

      await TestBed.configureTestingModule({
        imports: [ExperimentStageComponent],
        providers: [
          {
            provide: ImageLoaderService,
            useValue: { loadFile, sampleImage: () => sample },
          },
        ],
      }).compileComponents();

      const registry = TestBed.inject(ExperimentRegistry);
      registry.clear();
      const experimentFn = vi.fn<ExperimentFn>(() => ({
        visualizationData: undefined,
      }));
      registry.register('exp-image', experimentFn);

      const setExperimentState = vi.fn();
      const runtime = {
        getExperimentState: vi.fn(() => undefined),
        setExperimentState,
        publishComputation: vi.fn(),
      } as unknown as LabRuntimeService;

      const config: StageConfig = {
        type: 'experimentacao',
        title: 'Imagem',
        component: 'experiment',
        experimentConfig: {
          experimentFnId: 'exp-image',
          parameters: [{ name: 'image', type: 'image', label: 'Imagem' }],
          visualization: { type: 'image-tensor', accessibility: ACCESSIBILITY },
        },
      };

      const fixture = TestBed.createComponent(ExperimentStageComponent, {
        bindings: [
          inputBinding('config', () => config),
          inputBinding('stageIndex', () => 5),
          inputBinding('runtime', () => runtime),
        ],
      });
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.accept).toBe('image/*');
      expect(experimentFn).toHaveBeenCalledTimes(1);
      expect(experimentFn.mock.calls[0][0]['image']).toBe(sample);

      const file = new File([new Uint8Array([1])], 'foto.png', { type: 'image/png' });
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();

      expect(loadFile).toHaveBeenCalledWith(file);
      expect(experimentFn).toHaveBeenCalledTimes(2);
      expect(experimentFn.mock.calls[1][0]['image']).toBe(loaded);

      const saved = setExperimentState.mock.calls.at(-1)?.[1] as Record<string, unknown>;
      expect(saved['image']).toEqual({ name: 'foto.png', width: 4, height: 4 });
    } finally {
      vi.useRealTimers();
    }
  });
});

@Component({
  imports: [ChallengeStageComponent],
  template: `
    <app-challenge-stage
      [config]="config"
      [stageIndex]="0"
      [runtime]="runtime"
      (stageComplete)="onComplete($event)"
    />
  `,
})
class ChallengeHostComponent {
  private readonly progress = inject(ProgressService);

  readonly runtime = runtimeStub;
  readonly config = multipleChoiceConfig();

  onComplete(event: StageCompletionEvent): void {
    this.progress.updateLab('lab-test', (lab) => ({
      ...lab,
      status: 'in-progress',
      completedStages: [...lab.completedStages, event.type],
    }));
  }

  completedStages(): string[] {
    return this.progress.getLabProgress('lab-test')?.completedStages ?? [];
  }
}

describe('stage completion updates progress', () => {
  it('records the completed stage type in ProgressService', async () => {
    await TestBed.configureTestingModule({ imports: [ChallengeHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ChallengeHostComponent);
    fixture.detectChanges();

    const radio = fixture.nativeElement.querySelector('input[value="a"]') as HTMLInputElement;
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element) =>
      element.textContent?.includes('Verificar resposta'),
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.completedStages()).toContain('desafio');
  });
});

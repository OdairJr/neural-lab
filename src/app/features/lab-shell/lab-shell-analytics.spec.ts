import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { LaboratoryConfig } from '@domain/content';
import { ProgressService } from '@domain/progress';
import { LabRuntimeService } from '@shared/runtime';
import { LAB_CONFIG } from './lab-config.token';
import { LabShellComponent } from './lab-shell.component';

const LAB: LaboratoryConfig = {
  id: 'lab-test',
  number: 1,
  slug: 'test',
  title: 'Laboratório de teste',
  description: 'Teste',
  estimatedMinutes: 5,
  prerequisites: [],
  concepts: [],
  category: 'tensors',
  memoryBudgetMB: 10,
  stages: [
    {
      type: 'contextualizacao',
      title: 'Contexto',
      component: 'markdown',
      config: { content: 'Olá, Tensor.' },
    },
  ],
};

function runtimeStub(): LabRuntimeService {
  return {
    labId: LAB.id,
    setLabId: vi.fn(),
  } as unknown as LabRuntimeService;
}

async function setup(runtime: LabRuntimeService): Promise<ComponentFixture<LabShellComponent>> {
  await TestBed.configureTestingModule({
    imports: [LabShellComponent],
    providers: [
      provideRouter([]),
      { provide: LAB_CONFIG, useValue: LAB },
      { provide: LabRuntimeService, useValue: runtime },
    ],
  }).compileComponents();

  TestBed.inject(ProgressService).reset();

  const fixture = TestBed.createComponent(LabShellComponent);
  fixture.detectChanges();
  fixture.detectChanges();
  return fixture;
}

describe('LabShellComponent analytics', () => {
  it('records lab-started and stage/lab completion events', async () => {
    const runtime = runtimeStub();
    const fixture = await setup(runtime);
    const progress = TestBed.inject(ProgressService);

    expect(runtime.setLabId).toHaveBeenCalledWith(LAB.id);
    expect(progress.analytics().some((event) => event.eventType === 'lab-started')).toBe(true);

    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((element) => element.textContent?.includes('Marcar etapa'));
    expect(button).toBeTruthy();
    button?.click();
    fixture.detectChanges();

    const eventTypes = progress.analytics().map((event) => event.eventType);
    expect(eventTypes).toContain('stage-completed');
    expect(eventTypes).toContain('lab-completed');
    expect(progress.getLabProgress(LAB.id)?.status).toBe('completed');
  });

  it('flushes accumulated lab time when the lab is destroyed', async () => {
    vi.useFakeTimers();
    try {
      const fixture = await setup(runtimeStub());
      vi.advanceTimersByTime(5000);

      fixture.destroy();

      const progress = TestBed.inject(ProgressService);
      expect(progress.getLabProgress(LAB.id)?.timeSpentMs).toBe(5000);
    } finally {
      vi.useRealTimers();
    }
  });
});

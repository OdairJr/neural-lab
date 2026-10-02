import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProgressService } from '@domain/progress';
import { ProgressComponent } from './progress.component';

async function setup(): Promise<ComponentFixture<ProgressComponent>> {
  await TestBed.configureTestingModule({ providers: [provideRouter([])] }).compileComponents();

  const progress = TestBed.inject(ProgressService);
  progress.reset();
  progress.updateLab('lab-01-tensors', (lab) => ({
    ...lab,
    status: 'in-progress',
    completedStages: ['contextualizacao'],
    timeSpentMs: 120_000,
    lastVisitedAt: new Date().toISOString(),
    challengeAttempts: [
      { stageIndex: 2, timestamp: new Date().toISOString(), success: false, hintUsed: false },
    ],
  }));

  const fixture = TestBed.createComponent(ProgressComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ProgressComponent', () => {
  it('shows per-lab completion, time, challenge attempts and last visit', async () => {
    const fixture = await setup();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('1/10');
    expect(text).toContain('2 min');
    expect(text).toContain('Desafios:');
    expect(text).toContain('Última visita:');
  });

  it('renders the 12-dimension mastery radar with an accessible data table', async () => {
    const fixture = await setup();

    const toggle = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Ver tabela de dados'));
    expect(toggle).toBeTruthy();
    toggle?.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      'app-concept-mastery-radar tbody tr',
    ) as NodeListOf<HTMLTableRowElement>;
    expect(rows).toHaveLength(12);
    const labels = Array.from(rows).map((row) => row.querySelector('th, td')?.textContent?.trim());
    expect(labels[0]).toBe('Tensors');
    expect(labels[11]).toBe('Memory');
  });

  it('wires the export analytics opt-in to the setting', async () => {
    const fixture = await setup();
    const progress = TestBed.inject(ProgressService);
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(progress.progress().settings.includeAnalyticsInExport).toBe(true);
    expect(
      progress.analytics().some((event) => event.eventType === 'settings-changed'),
    ).toBe(true);
  });
});

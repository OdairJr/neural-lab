import { TestBed } from '@angular/core/testing';
import { ANALYTICS_EVENT_LIMIT, ProgressService } from '@domain/progress';

function v1Document(): string {
  return JSON.stringify({
    version: 1,
    lastUpdated: '2024-01-01T00:00:00.000Z',
    labs: [
      {
        labId: 'lab-01-tensors',
        status: 'in-progress',
        completedStages: ['contextualizacao'],
        currentStageIndex: 0,
        timeSpentMs: 1200,
        challengeAttempts: [],
        experimentStates: {},
      },
    ],
    glossaryViews: [],
    settings: {
      theme: 'dark',
      reducedMotion: true,
      showUnderTheHood: true,
      language: 'pt-BR',
    },
    analytics: [],
  });
}

describe('ProgressService analytics', () => {
  let service: ProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressService);
    service.reset();
  });

  it('caps analytics at 1000 events, dropping the oldest', () => {
    for (let i = 0; i < ANALYTICS_EVENT_LIMIT + 5; i += 1) {
      service.recordAnalytics('settings-changed', { i });
    }

    const events = service.analytics();
    expect(events).toHaveLength(ANALYTICS_EVENT_LIMIT);
    expect(events[0].payload).toEqual({ i: 5 });
    expect(events[events.length - 1].payload).toEqual({ i: ANALYTICS_EVENT_LIMIT + 4 });
  });

  it('includes analytics in the export only when opted in', () => {
    service.recordAnalytics('lab-started', { labId: 'lab-01-tensors' });

    const withoutAnalytics = JSON.parse(service.exportToJson()) as Record<string, unknown>;
    expect('analytics' in withoutAnalytics).toBe(false);

    service.updateSettings((settings) => ({ ...settings, includeAnalyticsInExport: true }));
    const withAnalytics = JSON.parse(service.exportToJson()) as { analytics: unknown[] };
    expect(withAnalytics.analytics).toHaveLength(1);
  });

  it('tracks lab start and accumulates time', () => {
    service.markLabStarted('lab-01-tensors');

    let lab = service.getLabProgress('lab-01-tensors');
    expect(lab?.status).toBe('in-progress');
    expect(lab?.lastVisitedAt).toBeTruthy();

    service.addLabTime('lab-01-tensors', 5000);
    service.addLabTime('lab-01-tensors', -10);
    lab = service.getLabProgress('lab-01-tensors');
    expect(lab?.timeSpentMs).toBe(5000);

    expect(service.analytics().some((event) => event.eventType === 'lab-started')).toBe(true);
  });

  it('records glossary views once but logs every analytics event', () => {
    service.recordGlossaryView('tensor');
    service.recordGlossaryView('tensor');

    expect(service.progress().glossaryViews).toEqual(['tensor']);
    expect(
      service.analytics().filter((event) => event.eventType === 'glossary-viewed'),
    ).toHaveLength(2);
  });

  it('migrates a version 1 document, defaulting the new fields', () => {
    const migrated = service.importFromJson(v1Document());

    expect(migrated.version).toBe(2);
    expect(migrated.settings.includeAnalyticsInExport).toBe(false);
    expect(migrated.settings.theme).toBe('dark');
    expect(migrated.labs[0].lastVisitedAt).toBeNull();
    expect(migrated.labs[0].timeSpentMs).toBe(1200);
  });

  it('resets data from a newer schema version', () => {
    const migrated = service.importFromJson(
      JSON.stringify({ version: 99, labs: [{ labId: 'lab-x' }], settings: {} }),
    );

    expect(migrated.version).toBe(2);
    expect(migrated.labs).toEqual([]);
  });
});

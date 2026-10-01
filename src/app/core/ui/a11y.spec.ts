import { TestBed } from '@angular/core/testing';
import { LiveRegionService } from './live-region.service';
import { ReducedMotionMixin } from './reduced-motion.mixin';

describe('ReducedMotionMixin', () => {
  it('exposes a boolean prefersReducedMotion signal', () => {
    class Base {}

    const Mixed = ReducedMotionMixin(Base);
    const instance = new Mixed();

    expect(typeof instance.prefersReducedMotion()).toBe('boolean');
  });
});

describe('LiveRegionService', () => {
  beforeEach(() => {
    document.querySelectorAll('[data-live-region]').forEach((element) => element.remove());
    TestBed.configureTestingModule({});
  });

  it('announces messages through an aria-live region', async () => {
    const service = TestBed.inject(LiveRegionService);

    service.announce('Etapa concluída');
    await new Promise((resolve) => setTimeout(resolve, 0));

    const region = document.querySelector('[data-live-region="polite"]');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.textContent).toBe('Etapa concluída');
  });

  it('reuses the region for subsequent announcements', () => {
    const service = TestBed.inject(LiveRegionService);

    service.announce('primeira');
    service.announce('segunda');

    expect(document.querySelectorAll('[data-live-region="polite"]')).toHaveLength(1);
  });
});

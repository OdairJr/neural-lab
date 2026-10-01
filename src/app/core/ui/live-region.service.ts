import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

const VISUALLY_HIDDEN =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;' +
  'clip:rect(0,0,0,0);white-space:nowrap;border:0;';

export type LiveRegionPoliteness = 'polite' | 'assertive';

/**
 * Manages visually hidden `aria-live` regions used to announce dynamic
 * updates (stage completion, challenge results) to screen readers.
 */
@Injectable({ providedIn: 'root' })
export class LiveRegionService {
  private readonly document = inject(DOCUMENT);
  private readonly regions = new Map<LiveRegionPoliteness, HTMLElement>();

  /** Announces a message through the requested live region. */
  announce(message: string, politeness: LiveRegionPoliteness = 'polite'): void {
    const region = this.getRegion(politeness);
    region.textContent = '';

    // Clearing then re-setting on the next tick makes assistive technology
    // re-announce identical consecutive messages.
    setTimeout(() => {
      region.textContent = message;
    }, 0);
  }

  private getRegion(politeness: LiveRegionPoliteness): HTMLElement {
    const existing = this.regions.get(politeness);
    if (existing) {
      return existing;
    }

    const region = this.document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', 'status');
    region.setAttribute('data-live-region', politeness);
    region.setAttribute('style', VISUALLY_HIDDEN);
    this.document.body.appendChild(region);
    this.regions.set(politeness, region);
    return region;
  }
}

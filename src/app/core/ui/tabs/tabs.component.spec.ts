import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TabsComponent, type TabItem } from './tabs.component';

@Component({
  imports: [TabsComponent],
  template: `<app-tabs [tabs]="tabs()" [(activeId)]="activeId" />`,
})
class TabsHost {
  readonly tabs = signal<readonly TabItem[]>([
    { id: 'conceito', label: 'Conceito' },
    { id: 'experimento', label: 'Experimento' },
    { id: 'desafio', label: 'Desafio', disabled: true },
  ]);
  readonly activeId = signal('');
}

describe('TabsComponent', () => {
  async function createHost() {
    await TestBed.configureTestingModule({ imports: [TabsHost] }).compileComponents();
    const fixture = TestBed.createComponent(TabsHost);
    fixture.detectChanges();
    return fixture;
  }

  function tabButtons(fixture: ReturnType<typeof TestBed.createComponent<TabsHost>>) {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>,
    );
  }

  it('selects the first enabled tab by default', async () => {
    const fixture = await createHost();

    const tabs = tabButtons(fixture);
    expect(tabs).toHaveLength(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('switches the active tab on click', async () => {
    const fixture = await createHost();

    tabButtons(fixture)[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeId()).toBe('experimento');
    expect(tabButtons(fixture)[1].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons(fixture)[0].getAttribute('aria-selected')).toBe('false');
  });

  it('ignores disabled tabs', async () => {
    const fixture = await createHost();

    tabButtons(fixture)[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeId()).toBe('');
    expect(tabButtons(fixture)[2].getAttribute('aria-selected')).toBe('false');
  });

  it('supports arrow-key navigation', async () => {
    const fixture = await createHost();

    const first = tabButtons(fixture)[0];
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activeId()).toBe('experimento');
  });
});

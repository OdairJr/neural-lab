import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal
      [open]="open()"
      heading="Confirmar"
      [closeOnBackdrop]="closeOnBackdrop()"
      (closed)="onClosed()"
    >
      <button type="button" id="inside">Ação</button>
    </app-modal>
  `,
})
class ModalHost {
  readonly open = signal(true);
  readonly closeOnBackdrop = signal(true);
  closedCount = 0;

  onClosed(): void {
    this.closedCount += 1;
  }
}

describe('ModalComponent', () => {
  async function createHost() {
    await TestBed.configureTestingModule({ imports: [ModalHost] }).compileComponents();
    const fixture = TestBed.createComponent(ModalHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders an accessible dialog when open', async () => {
    const fixture = await createHost();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Confirmar');
  });

  it('does not render the dialog when closed', async () => {
    const fixture = await createHost();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('emits closed when the close button is activated', async () => {
    const fixture = await createHost();

    const closeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Fechar"]',
    ) as HTMLButtonElement;
    closeButton.click();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('emits closed when the backdrop is clicked', async () => {
    const fixture = await createHost();

    const backdrop = fixture.nativeElement.querySelector('[aria-hidden="true"]') as HTMLElement;
    backdrop.click();

    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('does not close on backdrop when closeOnBackdrop is false', async () => {
    const fixture = await createHost();
    fixture.componentInstance.closeOnBackdrop.set(false);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('[aria-hidden="true"]') as HTMLElement;
    backdrop.click();

    expect(fixture.componentInstance.closedCount).toBe(0);
  });
});

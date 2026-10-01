import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FocusTrapDirective } from '../focus-trap.directive';

let modalCounter = 0;

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusTrapDirective],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          (click)="onBackdropClick()"
        ></div>
        <div
          appFocusTrap
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          class="relative z-10 w-full max-w-lg rounded-nl border border-border bg-surface p-4 shadow-xl"
          (keydown.escape)="close()"
        >
          <div class="mb-3 flex items-start justify-between gap-4">
            <h2 [id]="titleId" class="text-base font-semibold text-text">{{ heading() }}</h2>
            <button
              type="button"
              class="rounded-sm p-1 text-text hover:bg-bg focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Fechar"
              (click)="close()"
            >
              ✕
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly heading = input('');
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  protected readonly titleId = `app-modal-title-${++modalCounter}`;

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  protected close(): void {
    this.closed.emit();
  }
}

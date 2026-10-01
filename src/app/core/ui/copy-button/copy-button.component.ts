import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { cn } from '@core/utils/classnames';

@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class]="classes"
      [attr.aria-label]="ariaLabel()"
      (click)="copy()"
    >
      {{ copied() ? copiedLabel() : label() }}
    </button>
  `,
})
export class CopyButtonComponent {
  private readonly document = inject(DOCUMENT);

  readonly text = input.required<string>();
  readonly label = input('Copiar');
  readonly copiedLabel = input('Copiado!');
  readonly ariaLabel = input('Copiar para a área de transferência');

  protected readonly copied = signal(false);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  protected readonly classes = cn(
    'rounded-nl border border-border bg-surface px-2 py-1 text-xs font-medium text-text',
    'hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  );

  async copy(): Promise<void> {
    const clipboard = this.document.defaultView?.navigator?.clipboard;
    try {
      await clipboard?.writeText(this.text());
      this.copied.set(true);
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => this.copied.set(false), 1500);
    } catch (error) {
      console.warn('[NeuralLab] Unable to copy to clipboard.', error);
    }
  }
}

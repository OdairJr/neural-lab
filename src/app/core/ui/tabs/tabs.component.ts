import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { cn } from '@core/utils/classnames';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="tablist" class="flex flex-wrap gap-1 border-b border-border">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          [id]="tabId(tab.id)"
          [attr.aria-selected]="isActive(tab.id)"
          [attr.tabindex]="isActive(tab.id) ? 0 : -1"
          [disabled]="tab.disabled === true"
          [class]="tabClasses(tab.id)"
          (click)="select(tab.id)"
          (keydown)="onKeydown($event)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    <div class="pt-4">
      <ng-content />
    </div>
  `,
})
export class TabsComponent {
  readonly tabs = input<readonly TabItem[]>([]);
  readonly activeId = model('');

  protected readonly currentId = computed(
    () => this.activeId() || this.firstEnabledId(),
  );

  protected isActive(id: string): boolean {
    return this.currentId() === id;
  }

  protected tabId(id: string): string {
    return `app-tab-${id}`;
  }

  protected tabClasses(id: string): string {
    return cn(
      'cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.isActive(id)
        ? 'border-primary text-primary'
        : 'border-transparent text-text hover:bg-surface',
    );
  }

  protected select(id: string): void {
    const tab = this.tabs().find((item) => item.id === id);
    if (tab && tab.disabled !== true) {
      this.activeId.set(id);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.tabs().filter((tab) => tab.disabled !== true);
    if (enabled.length === 0) {
      return;
    }

    const currentIndex = enabled.findIndex((tab) => tab.id === this.currentId());
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % enabled.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabled.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      this.activeId.set(enabled[nextIndex].id);
    }
  }

  private firstEnabledId(): string {
    return this.tabs().find((tab) => tab.disabled !== true)?.id ?? '';
  }
}

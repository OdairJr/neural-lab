import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ProgressService } from '@domain/progress';
import {
  ButtonComponent,
  CardComponent,
  MotionPreferenceService,
  ThemeService,
  type ThemePreference,
} from '@core/ui';

interface ThemeOption {
  value: ThemePreference;
  label: string;
}

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Configurações</h1>
        <p class="text-sm text-text/80">Preferências de aparência e gerenciamento de dados.</p>
      </header>

      <app-card>
        <fieldset class="space-y-3">
          <legend class="text-sm font-semibold">Tema</legend>
          @for (option of themeOptions; track option.value) {
            <label class="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="theme"
                [value]="option.value"
                [checked]="theme.preference() === option.value"
                (change)="setTheme(option.value)"
              />
              {{ option.label }}
            </label>
          }
        </fieldset>
      </app-card>

      <app-card>
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            [checked]="motion.reducedMotion()"
            (change)="setReducedMotion($event)"
          />
          Reduzir animações
        </label>
      </app-card>

      <app-card>
        <div class="space-y-3">
          <h2 class="text-sm font-semibold">Progresso</h2>
          <div class="flex flex-wrap gap-2">
            <app-button variant="secondary" size="sm" (click)="exportProgress()">
              Exportar
            </app-button>
            <app-button variant="danger" size="sm" (click)="resetProgress()">
              Apagar todo o progresso
            </app-button>
          </div>

          <div class="flex flex-col gap-1">
            <label for="progress-import" class="text-xs font-medium text-text/70">
              Importar progresso (JSON)
            </label>
            <input
              id="progress-import"
              type="file"
              accept="application/json,.json"
              (change)="importProgress($event)"
              class="text-sm"
            />
          </div>

          @if (message()) {
            <p class="text-sm" role="status">{{ message() }}</p>
          }
        </div>
      </app-card>
    </section>
  `,
})
export class SettingsComponent {
  private readonly document = inject(DOCUMENT);
  private readonly progressService = inject(ProgressService);

  protected readonly theme = inject(ThemeService);
  protected readonly motion = inject(MotionPreferenceService);
  protected readonly message = signal('');

  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
    { value: 'system', label: 'Sistema' },
  ];

  protected setTheme(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }

  protected setReducedMotion(event: Event): void {
    this.motion.setReducedMotion((event.target as HTMLInputElement).checked);
  }

  protected exportProgress(): void {
    const blob = new Blob([this.progressService.exportToJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = 'neural-lab-progress.json';
    anchor.click();
    URL.revokeObjectURL(url);
    this.message.set('Progresso exportado.');
  }

  protected async importProgress(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const json = await file.text();
      this.progressService.importFromJson(json);
      this.message.set('Progresso importado com sucesso.');
    } catch {
      this.message.set('Não foi possível importar o arquivo de progresso.');
    } finally {
      input.value = '';
    }
  }

  protected resetProgress(): void {
    const confirmed = this.document.defaultView?.confirm(
      'Tem certeza de que deseja apagar todo o progresso?',
    );
    if (!confirmed) {
      return;
    }
    this.progressService.reset();
    this.message.set('Progresso apagado.');
  }
}

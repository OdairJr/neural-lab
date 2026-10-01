import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { CodeViewMode } from '@domain/content';
import { CodeBlockComponent, TabsComponent, type TabItem } from '@core/ui';
import { CodeGeneratorService } from '@shared/code-view/code-generator.service';
import type { ComputationEvent, LabRuntimeService } from '@shared/runtime/lab-runtime.service';

const TABS: readonly TabItem[] = [
  { id: 'inputs', label: 'Entradas' },
  { id: 'operation', label: 'Operação' },
  { id: 'output', label: 'Saída' },
  { id: 'code', label: 'Código' },
];

const MODES: readonly { id: CodeViewMode; label: string }[] = [
  { id: 'essential', label: 'Essencial' },
  { id: 'annotated', label: 'Anotado' },
  { id: 'full', label: 'Completo' },
];

/**
 * "Under the Hood" panel: subscribes to the runtime computation stream and
 * shows the latest operation's inputs, output and generated code.
 */
@Component({
  selector: 'app-under-the-hood-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, DatePipe, TabsComponent],
  template: `
    <section class="space-y-3" aria-label="Por baixo dos panos">
      <h2 class="text-sm font-semibold">Por baixo dos panos</h2>

      @if (event(); as current) {
        <app-tabs [tabs]="tabs" [(activeId)]="activeTab">
          @switch (activeTab()) {
            @case ('inputs') {
              @if (current.inputs.length > 0) {
                <ul class="space-y-2">
                  @for (snapshot of current.inputs; track $index) {
                    <li class="rounded-nl border border-border bg-bg p-2 text-xs">
                      <span class="font-mono">shape [{{ snapshot.shape.join(', ') }}]</span>
                      — dtype {{ snapshot.dtype }}
                      <div class="mt-1 font-mono text-text/80">
                        [{{ snapshot.values.join(', ') }}{{ snapshot.truncated ? ', …' : '' }}]
                      </div>
                    </li>
                  }
                </ul>
              } @else {
                <p class="text-xs text-text/70">Nenhum tensor de entrada.</p>
              }
            }
            @case ('operation') {
              <p class="font-mono text-sm">{{ current.operation }}</p>
              <p class="mt-1 text-xs text-text/60">
                {{ current.timestamp | date: 'HH:mm:ss' }}
              </p>
            }
            @case ('output') {
              @if (current.output; as output) {
                <div class="rounded-nl border border-border bg-bg p-2 text-xs">
                  <span class="font-mono">shape [{{ output.shape.join(', ') }}]</span>
                  — dtype {{ output.dtype }}
                  <div class="mt-1 font-mono text-text/80">
                    [{{ output.values.join(', ') }}{{ output.truncated ? ', …' : '' }}]
                  </div>
                </div>
              } @else {
                <p class="text-xs text-text/70">Sem tensor de saída.</p>
              }
            }
            @case ('code') {
              <div class="space-y-2">
                <div class="flex flex-wrap gap-1" role="group" aria-label="Modo de código">
                  @for (mode of modes; track mode.id) {
                    <button
                      type="button"
                      [attr.aria-pressed]="codeMode() === mode.id"
                      [class]="
                        'rounded-nl px-2 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary ' +
                        (codeMode() === mode.id
                          ? 'bg-primary text-white'
                          : 'border border-border bg-surface text-text hover:bg-bg')
                      "
                      (click)="codeMode.set(mode.id)"
                    >
                      {{ mode.label }}
                    </button>
                  }
                </div>
                <app-code-block [code]="code()" />
              </div>
            }
          }
        </app-tabs>
      } @else {
        <p class="text-xs text-text/70">
          Execute uma operação para inspecionar os tensores e o código gerado.
        </p>
      }
    </section>
  `,
})
export class UnderTheHoodPanelComponent implements OnInit {
  readonly runtime = input.required<LabRuntimeService>();

  private readonly codeGenerator = inject(CodeGeneratorService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tabs = TABS;
  protected readonly modes = MODES;
  protected readonly activeTab = signal('inputs');
  protected readonly codeMode = signal<CodeViewMode>('annotated');
  protected readonly event = signal<ComputationEvent | null>(null);

  protected readonly code = computed(() => {
    const current = this.event();
    if (!current) {
      return '// Sem operação executada.';
    }
    return this.codeGenerator.generate(
      {
        operation: current.operation,
        inputs: current.inputs,
        output: current.output,
      },
      this.codeMode(),
    );
  });

  ngOnInit(): void {
    const runtime = this.runtime();
    this.event.set(runtime.latestComputation());
    runtime.computations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.event.set(event));
  }
}

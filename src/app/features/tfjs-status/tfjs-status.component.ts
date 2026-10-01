import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TfjsInitService, TfjsMemoryService, TensorSerializerService, TFJS_TOKEN, type TfjsMemorySnapshot, type TensorSnapshot } from '@core/tfjs';
import { BadgeComponent, ButtonComponent, CardComponent } from '@core/ui';

@Component({
  selector: 'app-tfjs-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Status do TensorFlow.js</h1>
        <p class="text-sm text-text/80">
          Diagnóstico do backend selecionado, uso de memória e uma operação de teste.
        </p>
      </header>

      <app-card>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium">Backend selecionado:</span>
          @if (backendLabel(); as label) {
            <app-badge variant="success">{{ label }}</app-badge>
          } @else {
            <app-badge variant="warning">indisponível</app-badge>
          }
        </div>
      </app-card>

      <app-card>
        <h2 class="mb-2 text-sm font-semibold">Memória</h2>
        @if (memory(); as snapshot) {
          <dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div>
              <dt class="text-text/60">Tensores</dt>
              <dd class="font-mono">{{ snapshot.numTensors }}</dd>
            </div>
            <div>
              <dt class="text-text/60">Bytes</dt>
              <dd class="font-mono">{{ snapshot.numBytes }}</dd>
            </div>
            <div>
              <dt class="text-text/60">Uso (MB)</dt>
              <dd class="font-mono">{{ snapshot.usedMemoryMB }}</dd>
            </div>
            <div>
              <dt class="text-text/60">Pico (MB)</dt>
              <dd class="font-mono">{{ snapshot.peakMemoryMB }}</dd>
            </div>
          </dl>
        }
        <div class="mt-3">
          <app-button variant="secondary" size="sm" (click)="refreshMemory()">
            Atualizar memória
          </app-button>
        </div>
      </app-card>

      <app-card>
        <h2 class="mb-2 text-sm font-semibold">Operação de teste</h2>
        <p class="text-sm text-text/80">
          <code class="font-mono">tf.tensor1d([1, 2, 3, 4]).square().sum()</code>
        </p>
        @if (testResult(); as result) {
          <p class="mt-2 text-sm">
            Resultado: <span class="font-mono">{{ result.sum }}</span> — shape
            [{{ result.snapshot.shape.join(', ') }}], dtype {{ result.snapshot.dtype }}
          </p>
          <p class="mt-1 text-xs text-text/60">
            Valores serializados: [{{ result.snapshot.values.join(', ') }}]
          </p>
        }
        <div class="mt-3">
          <app-button size="sm" (click)="runTest()">Executar operação</app-button>
        </div>
      </app-card>
    </section>
  `,
})
export class TfjsStatusComponent {
  private readonly init = inject(TfjsInitService);
  private readonly memoryService = inject(TfjsMemoryService);
  private readonly serializer = inject(TensorSerializerService);
  private readonly tf = inject(TFJS_TOKEN);

  protected readonly backendLabel = computed(() => this.init.getBackend() ?? this.tf.getBackend());
  protected readonly memory = signal<TfjsMemorySnapshot | null>(null);
  protected readonly testResult = signal<{ sum: number; snapshot: TensorSnapshot } | null>(null);

  constructor() {
    this.refreshMemory();
    this.runTest();
  }

  protected refreshMemory(): void {
    this.memory.set(this.memoryService.getMemorySnapshot());
  }

  protected runTest(): void {
    const tensor = this.tf.tensor1d([1, 2, 3, 4]);
    const sum = this.tf.tidy(() => tensor.square().sum().dataSync()[0]);
    const snapshot = this.serializer.serialize(tensor);
    tensor.dispose();

    this.testResult.set({ sum, snapshot });
    this.refreshMemory();
  }
}

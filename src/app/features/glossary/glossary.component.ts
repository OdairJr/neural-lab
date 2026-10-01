import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@core/ui';

@Component({
  selector: 'app-glossary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Glossário</h1>
        <p class="max-w-2xl text-sm text-text/80">
          Definições curtas dos conceitos de Machine Learning e TensorFlow.js usados nos
          laboratórios.
        </p>
      </header>

      <app-card>
        <p class="text-sm text-text/70">
          Os verbetes serão adicionados conforme os laboratórios forem implementados. Cada
          conceito aparecerá aqui com definição, fórmula (quando aplicável), API do
          TensorFlow.js e laboratórios relacionados.
        </p>
      </app-card>
    </section>
  `,
})
export class GlossaryComponent {}

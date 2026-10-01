import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen flex-col bg-bg text-text">
      <header class="border-b border-border bg-surface">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <a routerLink="/jornada" class="text-base font-bold text-primary">Neural Lab</a>
          <nav aria-label="Navegação principal" class="flex flex-wrap items-center gap-1">
            @for (link of links; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-primary text-white"
                class="rounded-nl px-3 py-1.5 text-sm font-medium hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {{ link.label }}
              </a>
            }
          </nav>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <router-outlet />
      </main>

      <footer class="border-t border-border px-4 py-4 text-center text-xs text-text/70">
        Neural Lab — aprenda Machine Learning com TensorFlow.js
      </footer>
    </div>
  `,
})
export class MainLayoutComponent {
  protected readonly links: readonly NavLink[] = [
    { path: '/jornada', label: 'Jornada' },
    { path: '/laboratorios', label: 'Laboratórios' },
    { path: '/glossario', label: 'Glossário' },
    { path: '/progresso', label: 'Progresso' },
    { path: '/configuracoes', label: 'Configurações' },
  ];
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CopyButtonComponent } from '../copy-button/copy-button.component';

@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyButtonComponent],
  template: `
    <div class="relative overflow-hidden rounded-nl border border-border bg-slate-950 text-slate-100">
      @if (showCopy()) {
        <div class="absolute right-2 top-2">
          <app-copy-button [text]="code()" />
        </div>
      }
      <pre class="overflow-x-auto p-4 text-xs leading-relaxed"><code [attr.data-language]="language()">{{ code() }}</code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly language = input('typescript');
  readonly showCopy = input(true);
}

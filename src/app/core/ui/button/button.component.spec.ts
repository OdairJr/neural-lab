import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [type]="type()"
    >
      Salvar
    </app-button>
  `,
})
class ButtonHost {
  readonly variant = signal<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
  readonly type = signal<'button' | 'submit' | 'reset'>('button');
}

describe('ButtonComponent', () => {
  async function createHost() {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders projected content inside a native button', async () => {
    const fixture = await createHost();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Salvar');
    expect(button.type).toBe('button');
  });

  it('reflects the disabled state', async () => {
    const fixture = await createHost();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('applies variant and size classes', async () => {
    const fixture = await createHost();
    fixture.componentInstance.variant.set('danger');
    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('bg-red-600');
    expect(button.className).toContain('h-12');
  });
});

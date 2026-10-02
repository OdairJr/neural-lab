import { inputBinding } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import type { VisualizationConfig, VisualizationData } from '@domain/content';
import { ImageTensorComponent } from './image-tensor.component';

const CONFIG: VisualizationConfig = {
  type: 'image-tensor',
  accessibility: {
    ariaLabel: 'Imagem e tensor',
    dataTableAlternative: true,
    colorBlindSafe: true,
  },
};

function imageData(): Extract<VisualizationData, { type: 'image-tensor' }> {
  return {
    type: 'image-tensor',
    original: {
      width: 2,
      height: 2,
      data: Uint8ClampedArray.from([
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
      ]),
    } as unknown as ImageData,
    tensor: {
      shape: [2, 2, 3],
      dtype: 'float32',
      values: [1, 2, 3, 4, 5, 6],
      size: 6,
      truncated: false,
      stats: { min: 1, max: 6, mean: 3.5, std: 1.7 },
    },
    channels: 'RGB',
  };
}

/** Stable reference: the app passes a stable object across change detections. */
const DATA = imageData();

async function render(): Promise<ComponentFixture<ImageTensorComponent>> {
  await TestBed.configureTestingModule({ imports: [ImageTensorComponent] }).compileComponents();
  const fixture = TestBed.createComponent(ImageTensorComponent, {
    bindings: [inputBinding('data', () => DATA), inputBinding('config', () => CONFIG)],
  });
  fixture.detectChanges();
  return fixture;
}

function tableButton(fixture: ComponentFixture<ImageTensorComponent>): HTMLButtonElement {
  return [...fixture.nativeElement.querySelectorAll('button')].find((button) =>
    button.textContent?.includes('Ver tabela de dados'),
  ) as HTMLButtonElement;
}

describe('ImageTensorComponent', () => {
  it('renders the preview and shape readout even without a canvas context', async () => {
    const fixture = await render();

    // jsdom has no canvas backend, so `getContext('2d')` returns null and the
    // component must still render its data-driven readout.
    expect(fixture.nativeElement.textContent).toContain('shape [2, 2, 3]');
    expect(fixture.nativeElement.textContent).toContain('2×2');

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toBe('Imagem e tensor');
  });

  it('exposes an accessible data-table alternative with one row per value', async () => {
    const fixture = await render();

    tableButton(fixture).click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(6);
  });

  it('toggles the preview channel without mutating the input data', async () => {
    const fixture = await render();
    const before = Array.from(DATA.original.data);

    const radios = fixture.nativeElement.querySelectorAll(
      'input[type="radio"]',
    ) as NodeListOf<HTMLInputElement>;
    expect(radios).toHaveLength(2);
    expect(radios[0].checked).toBe(true);

    radios[1].checked = true;
    radios[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const updated = fixture.nativeElement.querySelectorAll(
      'input[type="radio"]',
    ) as NodeListOf<HTMLInputElement>;
    expect(updated[1].checked).toBe(true);
    expect(updated[0].checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('canal grayscale');
    expect(Array.from(DATA.original.data)).toEqual(before);
  });

  it('shows a fallback when no image data is provided', async () => {
    await TestBed.configureTestingModule({ imports: [ImageTensorComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ImageTensorComponent, {
      bindings: [
        inputBinding('data', () => ({ type: 'tensor-grid' } as unknown as VisualizationData)),
        inputBinding('config', () => CONFIG),
      ],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sem dados de imagem');
  });
});

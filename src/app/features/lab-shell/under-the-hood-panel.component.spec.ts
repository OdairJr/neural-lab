import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import type { ComputationEvent, LabRuntimeService } from '@shared/runtime';
import { UnderTheHoodPanelComponent } from './under-the-hood-panel.component';

function runtimeWith(event: ComputationEvent): LabRuntimeService {
  return {
    latestComputation: () => event,
    computations$: EMPTY,
  } as unknown as LabRuntimeService;
}

describe('UnderTheHoodPanelComponent', () => {
  it('shows the TF.js code the lab executed instead of a generated call', async () => {
    const event: ComputationEvent = {
      operation: 'lab-15-images',
      inputs: [],
      code: 'tf.browser.fromPixels(image).toFloat()',
      timestamp: 0,
    };

    await TestBed.configureTestingModule({
      imports: [UnderTheHoodPanelComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnderTheHoodPanelComponent, {
      bindings: [inputBinding('runtime', () => runtimeWith(event))],
    });
    fixture.detectChanges();

    const codeTab = fixture.nativeElement.querySelector(
      '#app-tab-code',
    ) as HTMLButtonElement;
    codeTab.click();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('tf.browser.fromPixels(image).toFloat()');
    expect(text).not.toContain('tf.lab-15-images(');
  });

  it('falls back to generated code when the lab published none', async () => {
    const event: ComputationEvent = {
      operation: 'matMul',
      inputs: [],
      timestamp: 0,
    };

    await TestBed.configureTestingModule({
      imports: [UnderTheHoodPanelComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnderTheHoodPanelComponent, {
      bindings: [inputBinding('runtime', () => runtimeWith(event))],
    });
    fixture.detectChanges();

    const codeTab = fixture.nativeElement.querySelector(
      '#app-tab-code',
    ) as HTMLButtonElement;
    codeTab.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('const result = tf.matMul');
  });
});

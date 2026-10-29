import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Focuses the element as soon as it appears. The HTML `autofocus` attribute only works on page load,
 * not for elements added later by @if — this directive does.
 */
@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => element.focus());
  }
}

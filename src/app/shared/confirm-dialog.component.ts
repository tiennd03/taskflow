import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText: string;
}

/** Yes/no dialog built on the unstyled CDK Dialog. Closes with `true` when confirmed. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-labelledby="confirm-title">
      <h2 id="confirm-title" class="text-lg font-semibold">{{ data.title }}</h2>
      <p class="mt-2 text-sm text-slate-600">{{ data.message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn-secondary" (click)="ref.close(false)">Cancel</button>
        <button type="button" class="btn-danger" (click)="ref.close(true)">{{ data.confirmText }}</button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

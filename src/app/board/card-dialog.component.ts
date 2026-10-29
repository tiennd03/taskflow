import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { parseLabels } from './board.logic';
import { Card, CardInput, PRIORITIES, PRIORITY_LABELS, Priority } from './board.models';
import { PRIORITY_CLASSES } from '../shared/styles';

export interface CardDialogData {
  /** Existing card to edit, or undefined to create one. */
  card?: Card;
  columnId: string;
  columns: Array<{ id: string; title: string }>;
}

export type CardDialogResult =
  | { action: 'save'; input: CardInput; columnId: string }
  | { action: 'delete' };

@Component({
  selector: 'app-card-dialog',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-dialog.component.html',
})
export class CardDialogComponent {
  protected readonly data = inject<CardDialogData>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<CardDialogResult>>(DialogRef);

  protected readonly priorities = PRIORITIES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly priorityClasses = PRIORITY_CLASSES;
  protected readonly isEdit = !!this.data.card;

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: [this.data.card?.title ?? '', [Validators.required, Validators.maxLength(120)]],
    description: [this.data.card?.description ?? '', Validators.maxLength(1000)],
    priority: [this.data.card?.priority ?? ('medium' as Priority)],
    labels: [this.data.card?.labels.join(', ') ?? ''],
    dueDate: [this.data.card?.dueDate ?? ''],
    columnId: [this.data.columnId],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({
      action: 'save',
      columnId: v.columnId,
      input: {
        title: v.title.trim(),
        description: v.description.trim(),
        priority: v.priority,
        labels: parseLabels(v.labels),
        dueDate: v.dueDate || null,
      },
    });
  }

  protected remove(): void {
    this.ref.close({ action: 'delete' });
  }

  protected cancel(): void {
    this.ref.close();
  }
}

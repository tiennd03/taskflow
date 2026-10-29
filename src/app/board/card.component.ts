import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { isOverdue, todayISO } from './board.logic';
import { Card, PRIORITY_LABELS } from './board.models';
import { PRIORITY_CLASSES, labelClass } from '../shared/styles';

@Component({
  selector: 'app-card',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = card();
    <button
      type="button"
      (click)="open.emit()"
      class="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition
        hover:border-indigo-300 hover:shadow-md"
      [class.opacity-70]="done()"
    >
      @if (c.labels.length) {
        <div class="mb-2 flex flex-wrap gap-1">
          @for (label of c.labels; track label) {
            <span class="rounded-md px-1.5 py-0.5 text-xs font-medium" [class]="labelClass(label)">{{ label }}</span>
          }
        </div>
      }

      <p class="text-sm font-medium leading-snug" [class.line-through]="done()">{{ c.title }}</p>

      <div class="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span class="flex items-center gap-1.5" [attr.title]="priorityLabels[c.priority] + ' priority'">
          <span class="size-2 rounded-full" [class]="priorityClasses[c.priority]"></span>
          {{ priorityLabels[c.priority] }}
        </span>

        @if (c.dueDate) {
          <span
            class="flex items-center gap-1 rounded-md px-1.5 py-0.5"
            [class]="overdue() ? 'bg-rose-50 font-medium text-rose-600' : ''"
            [attr.title]="overdue() ? 'Overdue' : 'Due date'"
          >
            📅 {{ c.dueDate | date: 'MMM d' }}
          </span>
        }

        @if (c.description) {
          <span class="ml-auto" title="Has a description">≡</span>
        }
      </div>
    </button>
  `,
})
export class CardComponent {
  readonly card = input.required<Card>();
  /** Cards in the last column are finished: shown faded and never overdue. */
  readonly done = input(false);
  readonly open = output<void>();

  protected readonly labelClass = labelClass;
  protected readonly priorityClasses = PRIORITY_CLASSES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly overdue = computed(() => !this.done() && isOverdue(this.card(), todayISO()));
}

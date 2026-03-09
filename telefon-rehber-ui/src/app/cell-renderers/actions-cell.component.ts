import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface ActionsCellContext {
  onEdit: (contact: unknown) => void;
  onDelete: (contact: unknown) => void;
  editLabel: string;
  deleteLabel: string;
}

@Component({
  selector: 'app-actions-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="actions-cell">
      <button type="button" class="btn btn-ghost" (click)="onEdit()">{{ editLabel }}</button>
      <button type="button" class="btn btn-danger" (click)="onDelete()">{{ deleteLabel }}</button>
    </span>
  `,
  styles: [`
    .actions-cell { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .btn { border-radius: 9999px; border: none; padding: 0.4rem 0.9rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .btn-ghost { background-color: transparent; color: #374151; }
    .btn-ghost:hover { background-color: #f3f4f6; }
    .btn-danger { background-color: #fee2e2; color: #b91c1c; }
    .btn-danger:hover { background-color: #fecaca; }
  `]
})
export class ActionsCellComponent implements ICellRendererAngularComp {
  private data: unknown = null;
  private context: ActionsCellContext | null = null;
  editLabel = 'Edit';
  deleteLabel = 'Delete';

  agInit(params: ICellRendererParams): void {
    this.data = params.data;
    this.context = (params.context as ActionsCellContext) ?? null;
    if (this.context) {
      this.editLabel = this.context.editLabel ?? 'Edit';
      this.deleteLabel = this.context.deleteLabel ?? 'Delete';
    }
  }

  refresh(params: ICellRendererParams): boolean {
    this.data = params.data;
    return true;
  }

  onEdit(): void {
    this.context?.onEdit(this.data);
  }

  onDelete(): void {
    this.context?.onDelete(this.data);
  }
}

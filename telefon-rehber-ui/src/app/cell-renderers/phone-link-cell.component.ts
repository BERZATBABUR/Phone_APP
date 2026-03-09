import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phone-link-cell',
  standalone: true,
  imports: [],
  template: `<a class="btn btn-call" [href]="href" [attr.title]="callTitle">{{ phoneNumber }}</a>`,
  styles: [`
    a { color: #059669; text-decoration: none; font-weight: 600; padding: 0.2rem 0.4rem; border-radius: 0.375rem; }
    a:hover { background-color: #d1fae5; color: #047857; }
  `]
})
export class PhoneLinkCellComponent implements ICellRendererAngularComp {
  phoneNumber = '';
  href = '';
  callTitle = '';

  agInit(params: ICellRendererParams): void {
    this.phoneNumber = params.value ?? '';
    this.href = `tel:${this.phoneNumber}`;
    this.callTitle = params.colDef?.headerName ?? 'Call';
  }

  refresh(params: ICellRendererParams): boolean {
    this.phoneNumber = params.value ?? '';
    this.href = `tel:${this.phoneNumber}`;
    return true;
  }
}

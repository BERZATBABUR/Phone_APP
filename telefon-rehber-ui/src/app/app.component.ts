import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { PhoneLinkCellComponent } from './cell-renderers/phone-link-cell.component';
import { ActionsCellComponent, ActionsCellContext } from './cell-renderers/actions-cell.component';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AgGridAngular
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Telefon Rehberi';

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: FormGroup;
  isEditMode = false;
  editingContactId: number | null = null;
  searchTerm = '';
  isFormOpen = false;

  columnDefs: ColDef<Contact>[] = [];
  gridContext: ActionsCellContext = {
    onEdit: (c) => this.startEdit(c as Contact),
    onDelete: (c) => this.delete(c as Contact),
    editLabel: 'Düzenle',
    deleteLabel: 'Sil'
  };
  defaultColDef: ColDef = { sortable: true, filter: true, flex: 1, minWidth: 100 };

  private readonly apiBaseUrl = '/api/contacts';
  private langSub: ReturnType<TranslateService['onLangChange']['subscribe']> | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    public translate: TranslateService
  ) {
    this.translate.addLangs(['tr', 'en']);
    this.translate.setDefaultLang('tr');
    if (!this.translate.currentLang) {
      this.translate.use('tr');
    }

    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.email, Validators.maxLength(200)]],
      address: ['', [Validators.maxLength(500)]],
      notes: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.buildColumnDefs();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.buildColumnDefs();
      this.updateGridContextLabels();
    });
    this.updateGridContextLabels();
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private buildColumnDefs(): void {
    const t = (key: string) => this.translate.instant(key);
    this.columnDefs = [
      {
        headerName: t('list.colName'),
        valueGetter: (params) => params.data ? `${params.data.firstName} ${params.data.lastName}` : '',
        flex: 1,
        minWidth: 140
      },
      {
        headerName: t('list.colPhone'),
        field: 'phoneNumber',
        cellRenderer: PhoneLinkCellComponent,
        flex: 1,
        minWidth: 130
      },
      { headerName: t('list.colEmail'), field: 'email', valueFormatter: (p) => p.value ?? '-', flex: 1, minWidth: 140 },
      { headerName: t('list.colAddress'), field: 'address', valueFormatter: (p) => p.value ?? '-', flex: 1, minWidth: 120 },
      {
        headerName: t('list.colActions'),
        cellRenderer: ActionsCellComponent,
        cellRendererParams: {},
        colId: 'actions',
        flex: 0,
        minWidth: 160,
        sortable: false,
        filter: false
      }
    ];
  }

  private updateGridContextLabels(): void {
    this.gridContext.editLabel = this.translate.instant('list.edit');
    this.gridContext.deleteLabel = this.translate.instant('list.delete');
  }

  private showSuccess(message: string): void {
    this.errorMessage = '';
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }

  private showError(message: string): void {
    this.successMessage = '';
    this.errorMessage = message;
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
  }

  loadContacts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.get<Contact[]>(this.apiBaseUrl).subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.showError(this.translate.instant('messages.loadError'));
        this.isLoading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.form.value as Omit<Contact, 'id'>;

    if (this.isEditMode && this.editingContactId != null) {
      const updateBody: Contact = { id: this.editingContactId, ...body };
      this.http.put<void>(`${this.apiBaseUrl}/${this.editingContactId}`, updateBody).subscribe({
        next: () => {
          this.showSuccess(this.translate.instant('messages.updateSuccess'));
          this.resetForm();
          this.loadContacts();
          this.isFormOpen = false;
        },
        error: () => this.showError(this.translate.instant('messages.updateError'))
      });
    } else {
      this.http.post<Contact>(this.apiBaseUrl, body).subscribe({
        next: () => {
          this.showSuccess(this.translate.instant('messages.addSuccess'));
          this.resetForm();
          this.loadContacts();
          this.isFormOpen = false;
        },
        error: () => this.showError(this.translate.instant('messages.addError'))
      });
    }
  }

  startCreate(): void {
    this.isEditMode = false;
    this.editingContactId = null;
    this.form.reset();
    this.isFormOpen = true;
  }

  startEdit(contact: Contact): void {
    this.isEditMode = true;
    this.editingContactId = contact.id;
    this.form.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      email: contact.email ?? '',
      address: contact.address ?? '',
      notes: contact.notes ?? ''
    });
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
  }

  delete(contact: Contact): void {
    const name = `${contact.firstName} ${contact.lastName}`;
    const msg = this.translate.instant('messages.deleteConfirm', { name });
    if (!confirm(msg)) return;

    this.http.delete<void>(`${this.apiBaseUrl}/${contact.id}`).subscribe({
      next: () => {
        this.showSuccess(this.translate.instant('messages.deleteSuccess'));
        this.loadContacts();
      },
      error: () => this.showError(this.translate.instant('messages.deleteError'))
    });
  }

  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredContacts = [...this.contacts];
      return;
    }
    this.filteredContacts = this.contacts.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        c.phoneNumber.toLowerCase().includes(term) ||
        (c.email ?? '').toLowerCase().includes(term) ||
        (c.address ?? '').toLowerCase().includes(term)
      );
    });
  }

  resetForm(): void {
    this.form.reset();
    this.isEditMode = false;
    this.editingContactId = null;
  }
}

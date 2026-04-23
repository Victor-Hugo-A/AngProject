import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { TicketsService } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Category = { id: number; name: string };

@Component({
  standalone: true,
  selector: 'app-ticket-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './new.html',
  styleUrl: './new.scss'
})
export class TicketFormComponent {
  private tickets = inject(TicketsService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private store = inject(AuthStore);

  title = '';
  description = '';
  priority: Priority = 'MEDIUM';
  categoryId: number | '' = '';
  categories: Category[] = [];

  readonly minDescriptionLength = 10;

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.tickets.categories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats ?? [];
        if (!this.categoryId && this.categories.length) {
          this.categoryId = this.categories[0].id;
        }
      },
      error: () => this.toast.error('Falha ao carregar categorias')
    });
  }

  submit(): void {
    this.error.set(null);

    const trimmedTitle = this.title.trim();
    const trimmedDescription = this.description.trim();

    if (!trimmedTitle || !this.priority || this.categoryId === '' || this.categoryId == null) {
      this.toast.warning('Preencha titulo, prioridade e categoria.');
      return;
    }

    if (trimmedDescription.length < this.minDescriptionLength) {
      this.error.set(`A descricao deve ter no minimo ${this.minDescriptionLength} caracteres.`);
      this.toast.warning(`A descricao deve ter no minimo ${this.minDescriptionLength} caracteres.`);
      return;
    }

    const catId = typeof this.categoryId === 'string' ? Number(this.categoryId) : this.categoryId;

    this.loading.set(true);
    this.tickets.create({
      title: trimmedTitle,
      description: trimmedDescription,
      priority: this.priority,
      categoryId: catId
    }).subscribe({
      next: () => {
        this.toast.success('Chamado criado!');
        this.loading.set(false);
        void this.router.navigate(['/tickets']);
      },
      error: e => {
        console.error(e);
        this.loading.set(false);
        this.error.set('Erro ao criar chamado.');
      }
    });
  }

  logout(): void {
    this.store.clearSession();
    void this.router.navigateByUrl('/login');
  }

  cancel() {
    void this.router.navigateByUrl('/tickets');
  }
}

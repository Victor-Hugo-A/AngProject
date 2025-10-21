// src/app/pages/tickets/new/new.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
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
  // INJEÇÕES
  private tickets = inject(TicketsService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private store = inject(AuthStore);              // ✅ Agora existe this.store

  // MODELO
  title = '';
  description = '';
  priority: Priority = 'MEDIUM';
  categoryId: number | '' = '';
  categories: Category[] = [];

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

    if (!this.title.trim() || !this.priority || this.categoryId === '' || this.categoryId == null) {
      this.toast.warning('Preencha título, prioridade e categoria.');
      return;
    }

    const catId = typeof this.categoryId === 'string' ? Number(this.categoryId) : this.categoryId;

    this.loading.set(true);
    this.tickets.create({
      title: this.title.trim(),
      description: this.description?.trim() ?? '',
      priority: this.priority,
      categoryId: catId
    }).subscribe({
      next: () => {
        this.toast.success('Chamado criado!');
        this.loading.set(false);
        void this.router.navigate(['/tickets']);
      },
      error: (e) => {
        console.error(e);
        this.loading.set(false);
        this.error.set('Erro ao criar chamado.');
      }
    });
  }

  logout(): void {
    this.store.clearSession();                          // ✅ método correto do AuthStore
    void this.router.navigateByUrl('/login');    // ✅ trate/ignore a Promise
  }

cancel() { this.router.navigateByUrl('/tickets'); } // usado no "Cancelar" e no "← Voltar" se você trocar
}

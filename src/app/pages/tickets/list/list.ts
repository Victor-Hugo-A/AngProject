// src/app/pages/tickets/list.ts
import { Component, inject, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketsService, Ticket, Page } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class TicketsListComponent {
  private api   = inject(TicketsService);
  private router = inject(Router);
  private store  = inject(AuthStore);

  loading = signal(true);
  error   = signal<string | null>(null);

  // tabela
  items: Ticket[] = [];
  page = 0;
  size = 10;
  totalPages = 0;

  // filtros
  status = '';
  priority = '';
  category?: number | null;

  // filtro opcional “Somente meus”
  onlyMine = false;

  ngOnInit() { this.reload(); }

  reload() {
    this.loading.set(true);
    this.error.set(null);

    const me = this.store.user();

    const params: any = {
      page: this.page,
      size: this.size,
      sort: 'createdAt,desc',
      status: this.status || undefined,
      priority: this.priority || undefined,
      category: this.category || undefined
    };

    if (this.onlyMine && me) {
      const isAgent = (me.roles || []).some(r => r === 'SUPPORT' || r === 'ADMIN');
      if (isAgent) params.assigneeId = me.id;
      else params.requesterId = me.id;
    }

    this.api.list(params).subscribe({
      next: (p: Page<Ticket>) => { this.items = p.content; this.totalPages = p.totalPages; this.loading.set(false); },
      error: () => { this.error.set('Falha ao carregar tickets.'); this.loading.set(false); }
    });
  }

  next() { if (this.page < this.totalPages - 1) { this.page++; this.reload(); } }
  prev() { if (this.page > 0) { this.page--; this.reload(); } }

  open(t: Ticket) { this.router.navigate(['/tickets', t.id]); }

  // === devolvendo seus métodos ===
  back()   { this.router.navigateByUrl('/user'); }
  logout() { this.store.clearSession(); this.router.navigateByUrl('/login'); }
}

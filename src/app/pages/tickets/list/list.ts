import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService, Ticket, Page } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';

type TicketOwnership = 'all' | 'requester' | 'assignee';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class TicketsListComponent {
  private api = inject(TicketsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(AuthStore);

  loading = signal(true);
  error = signal<string | null>(null);

  items: Ticket[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  status = '';
  category?: number | null;
  onlyMine = false;
  ownership: TicketOwnership = 'all';

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.status = params.get('status') ?? '';
      this.onlyMine = params.get('onlyMine') === 'true';
      const ownership = params.get('ownership');
      this.ownership = ownership === 'requester' || ownership === 'assignee' ? ownership : 'all';
      this.page = Number(params.get('page') ?? 0) || 0;
      this.reload();
    });
  }

  reload() {
    this.loading.set(true);
    this.error.set(null);

    const me = this.store.user();

    const params: any = {
      page: this.page,
      size: this.size,
      sort: 'createdAt,desc',
      status: this.status || undefined,
      category: this.category || undefined
    };

    if (me) {
      if (this.ownership === 'assignee') {
        params.assigneeId = me.id;
      } else if (this.ownership === 'requester') {
        params.requesterId = me.id;
      } else if (this.onlyMine) {
        const isAgent = (me.roles || []).some(r => r === 'SUPPORT' || r === 'ADMIN');
        if (isAgent) params.assigneeId = me.id;
        else params.requesterId = me.id;
      }
    }

    this.api.list(params).subscribe({
      next: (p: Page<Ticket>) => {
        this.items = p.content;
        this.totalPages = p.totalPages;
        this.totalElements = p.totalElements;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar tickets.');
        this.loading.set(false);
      }
    });
  }

  next() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.reload();
    }
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.reload();
    }
  }

  open(t: Ticket) {
    void this.router.navigate(['/tickets', t.id]);
  }

  countByStatus(status: Ticket['status']) {
    return this.items.filter(ticket => ticket.status === status).length;
  }

  statusLabel(status: Ticket['status']) {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'RESOLVED':
        return 'Resolvido';
      case 'CLOSED':
        return 'Fechado';
    }
  }

  scopeLabel() {
    if (this.ownership === 'requester') return 'Solicitados por voce';
    if (this.ownership === 'assignee') return 'Atribuidos ao seu usuario';
    return this.onlyMine ? 'Somente meus tickets' : 'Fila completa';
  }

  back() {
    void this.router.navigateByUrl('/user');
  }

  logout() {
    this.store.clearSession();
    void this.router.navigateByUrl('/login');
  }
}

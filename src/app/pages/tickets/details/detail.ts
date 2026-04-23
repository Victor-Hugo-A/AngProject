import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketsService, Ticket, TicketHistoryEntry } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class TicketDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(TicketsService);
  store = inject(AuthStore);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  t: Ticket | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get(id).subscribe({
      next: ticket => {
        this.t = ticket;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Ticket nao encontrado.');
        this.loading.set(false);
      }
    });
  }

  canAssign(): boolean {
    const me = this.store.user();
    return !!me && (me.roles?.includes('SUPPORT') || me.roles?.includes('ADMIN'));
  }

  assignToMe() {
    if (!this.t || this.saving()) return;
    this.saving.set(true);
    this.api.assignToMe(this.t.id).subscribe({
      next: tk => {
        this.t = tk;
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Falha ao atribuir.');
      }
    });
  }

  setStatus(s: Ticket['status']) {
    if (!this.t || this.saving()) return;
    this.saving.set(true);
    this.api.changeStatus(this.t.id, s).subscribe({
      next: tk => {
        this.t = tk;
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Falha ao mudar status.');
      }
    });
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

  historyEntries() {
    return [...(this.t?.history ?? [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }

  historyBadge(entry: TicketHistoryEntry) {
    switch (entry.type) {
      case 'CREATED':
        return 'Criacao';
      case 'ASSIGNED':
        return 'Atribuicao';
      case 'STATUS_CHANGED':
        return 'Status';
    }
  }
}

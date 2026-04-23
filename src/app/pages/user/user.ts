import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore, SessionUser } from '../../services/auth.store';
import { UserService, KpiDTO } from '../../services/user.service';
import { TicketsService, Ticket, Page } from '../../services/tickets.service';

type TicketShortcut = 'mine' | 'assigned' | 'in-progress' | 'resolved';
type TicketOwnership = 'all' | 'requester' | 'assignee';

@Component({
  selector: 'app-user',
  standalone: true,
  templateUrl: './user.html',
  imports: [DatePipe],
  styleUrls: ['./user.scss']
})
export class UserComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  private ticketsService = inject(TicketsService);

  store = inject(AuthStore);

  loading = signal(true);
  error = signal<string | null>(null);

  currentUser: SessionUser | null = null;

  myOpenCount = 0;
  assignedToMeCount = 0;
  inProgressCount = 0;
  resolved30dCount = 0;

  myTickets: Ticket[] = [];
  myTicketsLoading = false;

  ngOnInit(): void {
    this.currentUser = this.store.user();

    this.userService.getMe().subscribe({
      next: u => {
        this.currentUser = u;
        this.loading.set(false);
        this.loadKpis();
        this.loadMyTickets();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Falha ao carregar seu perfil.');
      }
    });
  }

  private loadKpis(): void {
    this.userService.getKpis().subscribe({
      next: (k: KpiDTO) => {
        this.myOpenCount = k.myOpen ?? 0;
        this.assignedToMeCount = k.assignedToMe ?? 0;
        this.inProgressCount = k.inProgress ?? 0;
        this.resolved30dCount = k.resolvedLast30d ?? 0;
      }
    });
  }

  private loadMyTickets(): void {
    const user = this.store.user();
    if (!user) return;

    this.myTicketsLoading = true;
    this.ticketsService.list({
      requesterId: Number(user.id),
      page: 0,
      size: 4,
      sort: 'createdAt,desc'
    }).subscribe({
      next: (page: Page<Ticket>) => {
        this.myTickets = page.content ?? [];
        this.myTicketsLoading = false;
      },
      error: () => {
        this.myTickets = [];
        this.myTicketsLoading = false;
      }
    });
  }

  openTickets(shortcut?: TicketShortcut) {
    const queryParams: Record<string, string> = {};

    switch (shortcut) {
      case 'mine':
        queryParams['ownership'] = 'requester';
        break;
      case 'assigned':
        queryParams['ownership'] = 'assignee';
        break;
      case 'in-progress':
        queryParams['status'] = 'IN_PROGRESS';
        break;
      case 'resolved':
        queryParams['status'] = 'RESOLVED';
        break;
    }

    void this.router.navigate(['/tickets'], { queryParams });
  }

  openTicket(ticket: Ticket) {
    void this.router.navigate(['/tickets', ticket.id]);
  }

  ownershipLabel(mode: TicketOwnership) {
    switch (mode) {
      case 'requester':
        return 'solicitados por voce';
      case 'assignee':
        return 'realmente atribuidos ao seu usuario';
      default:
        return 'visiveis na fila atual';
    }
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

  toNewTicket() {
    void this.router.navigateByUrl('/tickets/new');
  }

  toKnowledge() {
    void this.router.navigateByUrl('/knowledge');
  }

  toProfile() {
    void this.router.navigateByUrl('/profile');
  }

  logout() {
    this.store.clearSession();
    void this.router.navigateByUrl('/login');
  }
}

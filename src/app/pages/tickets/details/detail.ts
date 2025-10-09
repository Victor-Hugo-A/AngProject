import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketsService, Ticket } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class TicketDetailComponent {
  private route = inject(ActivatedRoute);
  private api   = inject(TicketsService);
  store         = inject(AuthStore);

  loading = signal(true);
  saving  = signal(false);
  error   = signal<string | null>(null);

  t: Ticket | null = null;

  ngOnInit(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get(id).subscribe({
      next: (ticket) => { this.t = ticket; this.loading.set(false); },
      error: () => { this.error.set('Ticket não encontrado.'); this.loading.set(false); }
    });
  }

  canAssign(): boolean {
    const me = this.store.user();
    return !!me && (me.roles?.includes('SUPPORT') || me.roles?.includes('ADMIN'));
  }

  assignToMe(){
    if (!this.t || this.saving()) return;
    this.saving.set(true);
    this.api.assignToMe(this.t.id).subscribe({
      next: (tk) => { this.t = tk; this.saving.set(false); },
      error: () => { this.saving.set(false); this.error.set('Falha ao atribuir.'); }
    });
  }

  setStatus(s: Ticket['status']){
    if (!this.t || this.saving()) return;
    this.saving.set(true);
    this.api.changeStatus(this.t.id, s).subscribe({
      next: (tk) => { this.t = tk; this.saving.set(false); },
      error: () => { this.saving.set(false); this.error.set('Falha ao mudar status.'); }
    });
  }
}

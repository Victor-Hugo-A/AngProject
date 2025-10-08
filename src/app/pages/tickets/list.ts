import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketsService, Ticket, Page } from '../../services/tickets.service';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class TicketsListComponent {
  private api = inject(TicketsService);
  private router = inject(Router);
  store = inject(AuthStore);

  loading = signal(true);
  error   = signal<string | null>(null);

  items: Ticket[] = [];
  page = 0; size = 10; totalPages = 0;

  status = '';
  priority = '';

  ngOnInit(){ this.reload(); }

  reload(){
    this.loading.set(true);
    this.api.list({
      page: this.page, size: this.size,
      status: this.status || undefined,
      priority: this.priority || undefined,
      sort: 'createdAt,desc'
    }).subscribe({
      next: (p: Page<Ticket>) => {
        this.items = p.content;
        this.totalPages = p.totalPages;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar tickets.');
        this.loading.set(false);
      }
    });
  }

  next(){ if(this.page < this.totalPages-1){ this.page++; this.reload(); } }
  prev(){ if(this.page>0){ this.page--; this.reload(); } }

  back(){ this.router.navigateByUrl('/user'); }
  logout(){ this.store.clearSession(); this.router.navigateByUrl('/login'); }
}

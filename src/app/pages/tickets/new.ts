import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService, Category } from '../../services/tickets.service';
import {Router, RouterLink} from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './new.html',
  styleUrls: ['./new.scss']
})
export class TicketNewComponent {
  private api = inject(TicketsService);
  protected router = inject(Router);
  store = inject(AuthStore);

  loading = signal(false);
  error   = signal<string | null>(null);

  title = '';
  description = '';
  priority: 'LOW'|'MEDIUM'|'HIGH' = 'LOW';
  categoryId: number | null = null;

  categories: Category[] = [];

  ngOnInit(){
    this.api.categories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => {}
    });
  }

  submit(){
    if (this.loading()) return;
    this.loading.set(true);
    this.api.create({
      title: this.title,
      description: this.description,
      priority: this.priority,
      categoryId: this.categoryId ?? undefined
    }).subscribe({
      next: () => { this.loading.set(false); this.router.navigateByUrl('/tickets'); },
      error: () => { this.loading.set(false); this.error.set('Falha ao criar ticket'); }
    });
  }

  back(){ this.router.navigateByUrl('/tickets'); }
  logout(){ this.store.clearSession(); this.router.navigateByUrl('/login'); }
}

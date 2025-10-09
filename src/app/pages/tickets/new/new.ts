import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketsService, Category } from '../../../services/tickets.service';
import { AuthStore } from '../../../services/auth.store';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './new.html',
  styleUrls: ['./new.scss']
})
export class TicketNewComponent {
  private api = inject(TicketsService);
  private router = inject(Router);
  private store = inject(AuthStore);

  loading = signal(false);
  error   = signal<string | null>(null);

  // fields do form
  title = '';
  description = '';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  categoryId: number | null = null;

  categories: Category[] = [];

  ngOnInit() {
    this.api.categories().subscribe({
      next: (cs) => this.categories = cs ?? [],
      error: () => this.categories = [] // silencioso para não travar criação
    });
  }

  submit() {
    if (this.loading()) return;
    if (!this.title.trim()) { this.error.set('Informe um título.'); return; }

    this.loading.set(true);
    this.error.set(null);

    // monta somente o que tem valor
    const payload: any = {
      title: this.title.trim(),
      priority: this.priority
    };
    if (this.description?.trim()) payload.description = this.description.trim();
    if (this.categoryId != null)  payload.categoryId  = this.categoryId;

    this.api.create(payload).subscribe({
      next: (t) => {
        this.loading.set(false);
        // se já tiver detalhe, pode ir para /tickets/:id
        this.router.navigate(['/tickets']);
        // this.router.navigate(['/tickets', t.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Falha ao criar o ticket. Verifique os dados e tente novamente.');
        console.error('POST /api/tickets error', err);
      }
    });
  }

  // Botões do topo
  logout() { this.store.clearSession(); this.router.navigateByUrl('/login'); }
  cancel() { this.router.navigateByUrl('/tickets'); } // usado no "Cancelar" e no "← Voltar" se você trocar
}

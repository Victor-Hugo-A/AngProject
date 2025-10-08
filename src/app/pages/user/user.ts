import { Component, inject, signal } from '@angular/core';
import {Router} from '@angular/router';
import { AuthStore, SessionUser } from '../../services/auth.store';
import { UserService, KpiDTO } from '../../services/user.service';
import {TopbarComponent} from '../../componente/topbar/topbar.component';

@Component({
  selector: 'app-user',
  standalone: true,
  templateUrl: './user.html',
  imports: [
  ],
  styleUrls: ['./user.scss']
})
export class UserComponent {
  private router = inject(Router);
  store = inject(AuthStore);
  private userService = inject(UserService);

  loading = signal(true);
  error   = signal<string | null>(null);

  currentUser: SessionUser | null = null;

  myOpenCount = 0;
  assignedToMeCount = 0;
  inProgressCount = 0;
  resolved30dCount = 0;

  ngOnInit(): void {
    // cache imediato
    this.currentUser = this.store.user();

    // atualiza perfil e carrega KPIs
    this.userService.getMe().subscribe({
      next: u => {
        this.currentUser = u;
        this.loading.set(false);
        this.loadKpis();
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
        this.myOpenCount       = k.myOpen ?? 0;
        this.assignedToMeCount = k.assignedToMe ?? 0;
        this.inProgressCount   = k.inProgress ?? 0;
        this.resolved30dCount  = k.resolvedLast30d ?? 0;
      },
      error: () => {
        // deixa zero mesmo; evita quebrar a dashboard
      }
    });
  }

  // ações do topo
  toTickets()     { this.router.navigateByUrl('/tickets'); }
  toNewTicket()   { this.router.navigateByUrl('/tickets/new'); }
  toKnowledge()   { this.router.navigateByUrl('/knowledge'); }
  toProfile()     { this.router.navigateByUrl('/profile'); }
  logout()        { this.store.clearSession(); this.router.navigateByUrl('/login'); }
}

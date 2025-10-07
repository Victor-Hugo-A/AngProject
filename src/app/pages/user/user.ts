import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopbarComponent } from '../../componente/topbar/topbar.component'; // ajuste o path se preciso
import { AuthStore } from '../../services/auth.store';
import { KpiService } from '../../services/kpi.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, TopbarComponent],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class UserComponent {
  // Deixa o Router disponível no TS (não no template direto)
  private readonly router = inject(Router);
  private readonly store  = inject(AuthStore);
  private readonly kpi    = inject(KpiService);

  /** ===== USER (getter p/ template) ===== */
  private readonly currentUserSig = computed(() => this.store.user());
  get currentUser() { return this.currentUserSig(); }

  /** ===== KPI signals + getters p/ template ===== */
  private readonly myOpen       = signal(0);
  private readonly assignedToMe = signal(0);
  private readonly inProgress   = signal(0);
  private readonly resolved30d  = signal(0);

  get myOpenCount()       { return this.myOpen(); }
  get assignedToMeCount() { return this.assignedToMe(); }
  get inProgressCount()   { return this.inProgress(); }
  get resolved30dCount()  { return this.resolved30d(); }

  async ngOnInit() {
    try {
      const k = await this.kpi.getOverview(); // GET /api/kpis
      this.myOpen.set(k.myOpen ?? 0);
      this.assignedToMe.set(k.assignedToMe ?? 0);
      this.inProgress.set(k.inProgress ?? 0);
      this.resolved30d.set(k.resolved30d ?? 0);
    } catch {
      // TODO: tratar erro (toast/log)
    }
  }

  /** ===== Ações Topbar ===== */
  onTopbarLogout() {
    (this.store as any)?.logout?.(); // se existir
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
  onOpenProfile() {
    this.router.navigate(['/profile']);
  }
}

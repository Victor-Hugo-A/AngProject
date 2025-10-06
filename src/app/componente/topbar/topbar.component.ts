import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthStore } from '../../services/auth.store';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topbar">
      <a routerLink="/user" class="brand">SENAPPEN</a>
      <div class="spacer"></div>
      <span *ngIf="user()">{{ user()?.name }}</span>
      <button (click)="logout()">Sair</button>
    </header>
  `,
  styles: [`
    .topbar{display:flex;align-items:center;gap:1rem;padding:.75rem 1rem;border-bottom:1px solid #333}
    .brand{font-weight:700;text-decoration:none}
    .spacer{flex:1}
    button{padding:.4rem .8rem;border-radius:.5rem}
  `]
})
export class TopbarComponent {
  private store = inject(AuthStore);
  private router = inject(Router);
  private auth = inject(LoginService);
  user = computed(() => this.store.user());
  logout(){ this.auth.logout(); void this.router.navigateByUrl('/login'); }
}

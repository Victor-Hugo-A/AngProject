import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './componente/topbar/topbar.component'; // ajuste o path

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  // ✅ o template usa [user]="currentUser"
  currentUser: CurrentUser | null = {
    id: '1',
    name: 'Victor Hugo',
    email: 'victor@example.com',
    role: 'user',
    avatarUrl: null,
  };

  // ✅ o template usa (openProfile)="router.navigate(...)"
  // Deixe público para o template enxergar
  readonly router = inject(Router);

  // ✅ o template usa (logout)="handleLogout()"
  handleLogout() {
    // coloque sua lógica real (limpar token, chamar serviço, etc.)
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}

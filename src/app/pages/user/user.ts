import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopbarComponent, TopbarUser } from '../../componente/topbar/topbar.component'; // ajuste o path

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, TopbarComponent],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class UserComponent {
  readonly router = inject(Router);

  // dados exibidos no Topbar
  currentUser: TopbarUser | null = {
    id: '1',
    name: 'Victor Hugo',
    email: 'victor@example.com',
    role: 'user',
    avatarUrl: null,
  };

  // contadores usados no template
  myOpenCount = 3;
  assignedToMeCount = 1;
  inProgressCount = 2;
  resolved30dCount = 12;

  // usado no título "Bem-vindo, ..."
  user() { return this.currentUser; }

  onTopbarLogout() {
    // sua lógica real de logout
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}

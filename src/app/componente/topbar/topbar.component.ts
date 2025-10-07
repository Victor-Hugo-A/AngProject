import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type TopbarUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // ✅ nada de NgIf aqui
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() user: TopbarUser | null = null;

  @Output() logout = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();

  mobileOpen = signal(false);

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()   { this.mobileOpen.set(false); }

  onLogout()  { this.logout.emit();  this.closeMobile(); }
  onProfile() { this.openProfile.emit(); this.closeMobile(); }

  avatarFallback(name?: string | null) {
    if (!name) return 'U';
    const p = name.trim().split(/\s+/);
    return (p[0]?.[0] ?? 'U').toUpperCase() + (p[1]?.[0] ?? '').toUpperCase();
  }
}

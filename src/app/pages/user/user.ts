import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../services/auth.store';

@Component({
  standalone: true,
  selector: 'app-user',
  imports: [CommonModule],
  templateUrl: './user.html',
  styleUrl: './user.scss'
})
export class UserComponent {
  private store = inject(AuthStore);
  user = computed(() => this.store.user());
}

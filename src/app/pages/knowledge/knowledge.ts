import { Component, inject } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  templateUrl: './knowledge.html',
  imports: [
    RouterLink
  ],
  styleUrls: ['./knowledge.scss']
})
export class KnowledgeComponent {
  private router = inject(Router);
  store = inject(AuthStore);

  back(){ this.router.navigateByUrl('/user'); }
  logout(){ this.store.clearSession(); this.router.navigateByUrl('/login'); }
}

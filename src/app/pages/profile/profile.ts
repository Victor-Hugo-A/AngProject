import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../services/auth.store';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent {
  // DI
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);
  private readonly userService = inject(UserService);

  // UI state
  readonly loading = signal(false);
  readonly saving  = signal(false);
  readonly error   = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly editing = signal(false);

  // Form
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }],
  });

  ngOnInit() {
    const u = this.store.user();
    if (u) this.form.patchValue({ name: u.name, email: u.email });
  }

  // Actions
  back()   { this.router.navigateByUrl('/user'); }

  logout() {
    this.store.clearSession();
    this.router.navigateByUrl('/login');
  }

  refresh() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.userService.getMe().subscribe({
      next: () => {
        const u = this.store.user();
        if (u) this.form.patchValue({ name: u.name, email: u.email });
        this.loading.set(false);
        this.success.set('Perfil atualizado com sucesso.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível atualizar seu perfil agora.');
      }
    });
  }

  enableEdit() {
    const u = this.store.user();
    if (!u) return;
    this.form.reset({ name: u.name, email: u.email });
    this.editing.set(true);
    this.success.set(null);
    this.error.set(null);
  }

  cancelEdit() {
    this.editing.set(false);
    const u = this.store.user();
    if (u) this.form.patchValue({ name: u.name, email: u.email });
  }

  save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload = { name: this.form.get('name')!.value!.trim() };

    this.userService.updateMe(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.success.set('Alterações salvas.');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Falha ao salvar. Verifique e tente novamente.');
      }
    });
  }
}

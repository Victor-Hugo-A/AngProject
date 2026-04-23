import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../services/auth.store';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly store = inject(AuthStore);
  private readonly userService = inject(UserService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly editing = signal(false);
  readonly avatarPreview = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }]
  });

  ngOnInit() {
    this.syncFormFromStore();
  }

  private syncFormFromStore() {
    const u = this.store.user();
    if (!u) return;
    this.form.patchValue({ name: u.name, email: u.email });
    this.avatarPreview.set(u.avatarUrl ?? null);
  }

  back() {
    void this.router.navigateByUrl('/user');
  }

  logout() {
    this.store.clearSession();
    void this.router.navigateByUrl('/login');
  }

  refresh() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.userService.getMe().subscribe({
      next: () => {
        this.syncFormFromStore();
        this.loading.set(false);
        this.success.set('Perfil atualizado com sucesso.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Nao foi possivel atualizar seu perfil agora.');
      }
    });
  }

  enableEdit() {
    this.syncFormFromStore();
    this.editing.set(true);
    this.success.set(null);
    this.error.set(null);
  }

  cancelEdit() {
    this.editing.set(false);
    this.syncFormFromStore();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Selecione um arquivo de imagem valido.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(typeof reader.result === 'string' ? reader.result : null);
      this.error.set(null);
    };
    reader.onerror = () => {
      this.error.set('Nao foi possivel ler a imagem selecionada.');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeAvatar() {
    this.avatarPreview.set(null);
  }

  save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload = {
      name: this.form.get('name')!.value!.trim(),
      avatarUrl: this.avatarPreview()
    };

    this.userService.updateMe(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.syncFormFromStore();
        this.success.set('Alteracoes salvas.');
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Falha ao salvar. Verifique e tente novamente.');
      }
    });
  }
}

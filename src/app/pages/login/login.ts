import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Header } from '../../componente/header/header';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, Header, ReactiveFormsModule, PrimaryInput],
  providers: [LoginService],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toast: ToastrService
  ) {
    // agora o fb já foi injetado antes de usar
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    if (this.loginForm.invalid || this.loading) return;

    const { email, password } = this.loginForm.value as { email: string; password: string };
    this.loading = true;

    this.loginService.login(email, password).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso!');
        this.loading = false;
        // “void” silencia o aviso de promise não usada
        void this.router.navigateByUrl('/user');
      },
      error: (err) => {
        this.loading = false;

        const body = typeof err?.error === 'string' ? err.error.toLowerCase() : '';
        const name = (err?.error?.name ?? '').toLowerCase();

        if (err?.status === 403 || body.includes('não encontrado') || name.includes('não cadastrado')) {
          this.toast.error('Usuário não encontrado!');
        } else if (err?.status === 400 || body.includes('senha') || name.includes('senha')) {
          this.toast.error('Senha inválida');
        } else {
          this.toast.error('Erro inesperado, tente novamente mais tarde');
        }
      }
    });
  }

  navigateForgotPassword(): void {
    void this.router.navigate(['forgot']);
  }

  navigate(): void {
    void this.router.navigate(['signup']);
  }
}

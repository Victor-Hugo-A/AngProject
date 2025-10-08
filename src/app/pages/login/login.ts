import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Header } from '../../componente/header/header'; // Ajuste o caminho se necessário
import { PrimaryInput } from '../../componente/primary-input/primary-input'; // Ajuste o caminho se necessário
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, PrimaryInput],  // Certifique-se de que todos os módulos estão aqui
  providers: [LoginService],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = signal(false);  // Controla o estado do botão (loading)
  error = signal<string | null>(null);  // Controla o erro (caso haja)

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toast: ToastrService
  ) {
    // Inicializa o formulário
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Método de submit
  submit() {
    if (this.loginForm.invalid || this.loading()) return;

    // Marcar como em carregamento
    this.loading.set(true);
    this.error.set(null);

    // Pega os valores do formulário
    const { email, password } = this.loginForm.value;

    // Chama o serviço de login
    this.loginService.login(email, password).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso!');
        this.loading.set(false);  // Finaliza o carregamento
        this.router.navigateByUrl('/user');  // Redireciona para /user
      },
      error: (err) => {
        this.loading.set(false);  // Finaliza o carregamento em caso de erro

        // Trata os erros de login
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

  // Navegar para a página de "esqueci a senha"
  navigateForgotPassword(): void {
    this.router.navigate(['forgot']);
  }

  // Navegar para a página de "sign up" (registro)
  navigate(): void {
    this.router.navigate(['signup']);
  }
}

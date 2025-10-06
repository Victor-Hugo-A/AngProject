import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Header } from '../../componente/header/header';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, PrimaryInput],
  providers: [LoginService],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent {
  signupForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toast: ToastrService
  ) {
    // ✅ Inicialize o form AQUI — depois que o fb foi injetado
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  // 🔒 Validador customizado para comparar senhas
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('passwordConfirm')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  submit(): void {
    if (this.signupForm.invalid || this.loading) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.signupForm.value as { name: string; email: string; password: string };
    this.loading = true;

    this.loginService.register(name, email, password).subscribe({
      next: (_res: unknown) => {
        this.toast.success('Conta cadastrada com sucesso!');
        this.loading = false;
        void this.router.navigate(['login']); // ✅ ignora promise corretamente
      },
      error: (err: unknown) => {
        this.loading = false;

        const status = (err as any)?.status as number | undefined;
        const bodyStr = typeof (err as any)?.error === 'string' ? ((err as any).error as string).toLowerCase() : '';
        const nameStr = (((err as any)?.error?.name) ?? '').toLowerCase();

        if (status === 409 || bodyStr.includes('email') || nameStr.includes('email')) {
          this.toast.error('Já existe um usuário cadastrado com esse e-mail');
        } else {
          this.toast.error('Erro inesperado, tente novamente mais tarde');
        }
      }
    });
  }

  navigate(): void {
    void this.router.navigate(['login']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { Header } from '../../componente/header/header';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, PrimaryInput],
  templateUrl: './forgot.html',
  styleUrl: './forgot.scss'
})
export class ForgotComponent {
  form = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] })
  });
  isLoading = false;

  constructor(
    private loginService: LoginService,
    private toast: ToastrService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid || this.isLoading) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.form.controls.email.value;

    // passe também a URL do frontend para o link do e-mail
    this.loginService.forgotPassword(email, window.location.origin).subscribe({
      next: (_response: unknown) => {
        this.toast.success('Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.');
        this.isLoading = false;
        // ignore intencionalmente a Promise para evitar warning
        void this.router.navigate(['/login']);
      },
      error: (_error: unknown) => {
        this.toast.error('Ocorreu um erro ao processar sua solicitação.');
        this.isLoading = false;
      }
    });
  }

  private markFormAsTouched(): void {
    Object.values(this.form.controls).forEach((control) => control.markAllAsTouched());
  }

  navigateToLogin(): void {
    void this.router.navigate(['/login']);
  }
}

import { Component } from '@angular/core';
import { Header } from '../../componente/header/header';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, Header, PrimaryInput, CommonModule],
  templateUrl: './forgot.html',
  styleUrl: './forgot.scss'
})
export class Forgot {
    form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
    isLoading = false;

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    public router: Router
  ) {}

  submit() {
    if (this.form.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.form.value.email!;

    this.loginService.forgotPassword(email).subscribe({
      next: (response) => {

        if (response.exists) {
          this.toastService.success('Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.');
        } else {
          this.toastService.warning('Este email não está cadastrado em nosso sistema');
        }
        setTimeout(() => {
        this.router.navigate(['/login'])
      }, 3000);
    },
      error: (error) => {
        console.error('Erro:', error);
        this.toastService.error('Ocorreu um erro ao processar sua solicitação');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  markFormAsTouched() {
    Object.values(this.form.controls).forEach(control => {
      control.markAllAsTouched();
    });
  }

    navigateToLogin() {
      this.router.navigate(['/login'])
    }
  }
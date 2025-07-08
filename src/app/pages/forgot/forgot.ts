import { Component } from '@angular/core';
import { Header } from '../../componente/header/header';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, Header, PrimaryInput],
  templateUrl: './forgot.html',
  styleUrl: './forgot.scss'
})
export class Forgot {
    form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private loginService: LoginService,
    private toastService: ToastrService,
    public router: Router
  ) {}

  submit() {
    const email = this.form.get('email')?.value;
    if (!email || this.form.get('email')?.invalid) {
      this.toastService.error('Digite um email cadastrado para recuperar a senha.');
      return;
    }

    this.loginService.forgotPassword(email).subscribe({
      next: () => {
        this.toastService.success('Enviamos o link de redefinição de senha para o email cadastrado!');
        this.router.navigate(['login'])
      },
      error: (err) => {
        if (
          err.status === 404 ||
          (err.error && typeof err.error === 'string' && err.error.toLowerCase().includes('não cadastrado'))
        ) {
          this.toastService.error('Email não cadastrado.');
        } else {
          this.toastService.error('Erro ao recuperar a senha. Tente novamente');
          }
        }
      });
    }

    navigate() {
      this.router.navigate(['login'])
    }
  }

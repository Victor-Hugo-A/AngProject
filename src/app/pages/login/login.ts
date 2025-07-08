import { Component } from '@angular/core';
import { Header } from '../../componente/header/header';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    Header,
    ReactiveFormsModule,
    PrimaryInput
  ],
  providers: [
    LoginService
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm!: FormGroup;

  constructor( 
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ){
    // Initialization logic can go here
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    this.loginService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: () => {
          this.toastService.success("Login realizado com sucesso!");
          this.router.navigate(['user']);
        },
        error: (err) => {
          if (
            err.status === 403 ||
            (err.error && typeof err.error === 'string' && err.error.toLowerCase().includes('não encontrado')) ||
            (err.error && err.error.name && err.error.name.toLowerCase().includes('não cadastrado'))
          ) {
            this.toastService.error("Usuário não cadastrado, Faça o Registro!");
          } else if (
            err.status === 400 ||
            (err.error && typeof err.error === 'string' && err.error.toLowerCase().includes('senha')) ||
            (err.error && err.error.name && err.error.name.toLowerCase().includes('senha'))
          ) {            
            this.toastService.error("Senha inválida");
          } else {
            this.toastService.error("Erro inesperado, tente novamente mais tarde");
          }
        }
      })
    }

  navigateForgotPassword() {
    this.router.navigate(['forgot']);
  }

  navigate() {
    // Navigation logic can go here
    this.router.navigate(["signup"]);
  }
}
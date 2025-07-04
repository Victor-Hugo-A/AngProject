import { Component } from '@angular/core';
import { Header } from '../../componente/header/header';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

interface signupForm {
  name: FormControl,
  email: FormControl,
  password: FormControl,
  passwordConfirm: FormControl
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    Header,
    ReactiveFormsModule,
    PrimaryInput
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})

export class signUpComponent {
  signupForm!: FormGroup<signupForm>;

  constructor( 
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ){
    // Initialization logic can go here
    this.signupForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    this.loginService.signup(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password).subscribe({
        next: () => this.toastService.success("Conta cadastrada com sucesso!"),
        error: () => this.toastService.error("Erro inesperado, tente novamente mais tarde"),
    })
  }

  navigate() {
    // Navigation logic can go here
    this.router.navigate(["login"]);
  }
}
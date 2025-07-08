import { Component } from '@angular/core';
import { Header } from '../../componente/header/header';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInput } from '../../componente/primary-input/primary-input';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl } from '@angular/forms';

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
onTouched() {
throw new Error('Method not implemented.');
}
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
    }, { validators: signUpComponent.passwordsMatchValidator });
  }

    static passwordsMatchValidator(control: AbstractControl) {
      const form = control as FormGroup;
      const password = form.get('password')?.value;
      const passwordConfirm = form.get('passwordConfirm')?.value;
      return password === passwordConfirm ? null : { passwordsMismatch: true };
    }
  
  submit() {
    this.loginService.signup(this.signupForm.value.name, this.signupForm.value.email, this.signupForm.value.password).subscribe({
        next: () => this.toastService.success("Conta cadastrada com sucesso!"),
        error: (err) => {
          console.log('Erro no backend: ', err.error);
          if (
            err.status === 409 ||
            (err.error && typeof err.error === 'string' && err.error.toLowerCase().includes('email')) ||
            (err.error && err.error.name && err.error.name.toLowerCase().includes('email'))
          ) {
            this.toastService.error("Já existe um usuário cadastrado com esse email");
          } else {
            this.toastService.error("Erro inesperado, tente novamente mais tarde");
        }
      }
    });
  }

  navigate() {
    // Navigation logic can go here
    this.router.navigate(["login"]);
  }
}
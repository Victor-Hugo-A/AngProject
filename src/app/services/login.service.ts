import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpCliente: HttpClient) { }

  login(name: string, password: string) {
    return this.httpCliente.post<LoginResponse>("/login", { name, password }).pipe(
      // Handle the response here if needed
      tap((value) => {
        sessionStorage.setItem("token", value.token);
        sessionStorage.setItem("username", value.name);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthStore } from './auth.store';

type LoginResponse = { name: string; token: string };

const API = 'http://localhost:8080'; // ajuste se necessário

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, { email, password }).pipe(
      tap((res) => {
        // ⚠️ Isso precisa existir. Se faltar, o guard sempre enxerga “não autenticado”.
        this.store.setSession(res.token, { name: res.name, email });
      })
    );
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/signup`, { name, email, password }).pipe(
      tap((res) => {
        // opcional: já logar após registrar
        // this.store.setSession(res.token, { name: res.name, email });
      })
    );
  }

  forgotPassword(email: string, frontendUrl: string) {
    // alias para manter compatibilidade com o componente Forgot
    return this.requestReset(email, frontendUrl);
  }

  requestReset(email: string, frontendUrl: string) {
    return this.http.post(`${API}/auth/reset/request`, { email, frontendUrl });
  }

  confirmReset(token: string, newPassword: string) {
    return this.http.post(`${API}/auth/reset/confirm`, { token, newPassword });
  }

  logout() {
    this.store.clear();
  }
}

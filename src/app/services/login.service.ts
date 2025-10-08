import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthStore, SessionUser } from './auth.store'; // <- importe o tipo daqui

export type AuthPayload = {
  token: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role: string; // backend manda 1 papel
  };
};

const AUTH = '/auth';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  login(email: string, password: string) {
    return this.http.post<AuthPayload>(`${AUTH}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);

        // Mapear role (string) -> roles (string[])
        const u: SessionUser = {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          roles: [res.user.role],     // <- aqui está o ajuste chave
          avatarUrl: null
        };

        localStorage.setItem('auth_user', JSON.stringify(u));
        this.store.setSession(res.token, u);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthPayload> {
    return this.http.post<AuthPayload>(`${AUTH}/register`, { name, email, password }).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);

        const u: SessionUser = {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          roles: [res.user.role],     // <- idem
          avatarUrl: null
        };

        localStorage.setItem('auth_user', JSON.stringify(u));
        this.store.setSession(res.token, u);
      })
    );
  }

  requestReset(email: string, frontendUrl: string) {
    return this.http.post(`${AUTH}/reset/request`, { email, frontendUrl });
  }

  confirmReset(token: string, newPassword: string) {
    return this.http.post(`${AUTH}/reset/confirm`, { token, newPassword });
  }

  logout() {
    this.store.clearSession();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

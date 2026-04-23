import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { delay, Observable, of } from 'rxjs';
import { AuthStore, SessionUser } from './auth.store';
import { environment } from '../../environments/environment';
import { buildMockAuthPayload } from './mock-auth';

export type AuthPayload = {
  token: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role: string;
  };
};

const AUTH = '/auth';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  login(email: string, password: string) {
    if (environment.mockAuth) {
      return of(buildMockAuthPayload(email)).pipe(
        delay(300),
        tap((res) => this.persistSession(res))
      );
    }

    return this.http.post<AuthPayload>(`${AUTH}/login`, { email, password }).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  register(name: string, email: string, password: string): Observable<AuthPayload> {
    if (environment.mockAuth) {
      return of(buildMockAuthPayload(email, name)).pipe(
        delay(300),
        tap((res) => this.persistSession(res))
      );
    }

    return this.http.post<AuthPayload>(`${AUTH}/register`, { name, email, password }).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  requestReset(email: string, frontendUrl: string) {
    if (environment.mockAuth) {
      return of({ ok: true, email, frontendUrl }).pipe(delay(250));
    }

    return this.http.post(`${AUTH}/reset/request`, { email, frontendUrl });
  }

  confirmReset(token: string, newPassword: string) {
    if (environment.mockAuth) {
      return of({ ok: true, token, newPassword }).pipe(delay(250));
    }

    return this.http.post(`${AUTH}/reset/confirm`, { token, newPassword });
  }

  logout() {
    this.store.clearSession();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  private persistSession(res: AuthPayload) {
    localStorage.setItem('auth_token', res.token);

    const user: SessionUser = {
      id: String(res.user.id),
      name: res.user.name,
      email: res.user.email,
      roles: [res.user.role],
      avatarUrl: null
    };

    localStorage.setItem('auth_user', JSON.stringify(user));
    this.store.setSession(res.token, user);
  }
}

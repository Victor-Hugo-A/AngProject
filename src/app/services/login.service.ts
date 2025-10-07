import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthStore } from './auth.store';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];      // ou seu enum
    avatarUrl?: string | null;
  };
};

const AUTH = '/auth'; // ajuste se necessário

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(res => this.store.setSession(res.token, res.user))
    );
  }

  register(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${AUTH}/register`, { name, email, password });
  }

  requestReset(email: string, frontendUrl: string) {
    return this.http.post(`${AUTH}/reset/request`, { email, frontendUrl });
  }

  confirmReset(token: string, newPassword: string) {
    return this.http.post(`${AUTH}/reset/confirm`, { token, newPassword });
  }

  logout() {
    this.store.clearSession();
  }
}

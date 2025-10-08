// auth.store.ts
import { Injectable, signal, computed } from '@angular/core';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];  // Deve ser um array de roles
  avatarUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _token = signal<string | null>(localStorage.getItem('auth_token')); // Recupera o token do localStorage
  private _user = signal<SessionUser | null>(readUser('auth_user'));  // Recupera o usuário (auth_user)

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user()); // Verifica se está autenticado

  setSession(token: string, user: SessionUser) {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('auth_token', token); // Salva o token no localStorage
    localStorage.setItem('auth_user', JSON.stringify(user)); // Salva o auth_user no localStorage
  }

  clearSession() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  tryRestore(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = readUser('auth_user');
    if (!token || !user) { this.clearSession(); return false; }
    this._token.set(token);
    this._user.set(user);
    return true;
  }
}

function readUser(key: string): SessionUser | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionUser; } catch { return null; }
}

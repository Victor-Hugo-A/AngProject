import { Injectable, signal, computed } from '@angular/core';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];            // ajuste se usar enum
  avatarUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  /** Estado inicial: tenta restaurar do localStorage */
  private _token = signal<string | null>(localStorage.getItem('auth_token'));
  private _user  = signal<SessionUser | null>(readUser('auth_user'));

  /** Selectors (signals/computed) */
  readonly token = computed(() => this._token());
  readonly user  = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._token() && !!this._user());

  /** Salva sessão (chamado no login) */
  setSession(token: string, user: SessionUser) {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  /** Limpa sessão (logout) */
  clearSession() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /** Restaura sessão (opcional: chamar no guard/app init) */
  tryRestore(): boolean {
    const t = localStorage.getItem('auth_token');
    const u = readUser('auth_user');
    if (!t || !u) { this.clearSession(); return false; }
    this._token.set(t);
    this._user.set(u);
    return true;
  }
}

function readUser(key: string): SessionUser | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as SessionUser; } catch { return null; }
}

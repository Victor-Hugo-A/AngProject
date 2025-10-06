import { Injectable, signal } from '@angular/core';

export interface CurrentUser { name: string; email: string; }

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _token = signal<string | null>(localStorage.getItem('token'));
  private _user  = signal<CurrentUser | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  token() { return this._token(); }
  user()  { return this._user(); }
  isAuthenticated() { return !!this._token(); }

  setSession(token: string, user: CurrentUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }
}

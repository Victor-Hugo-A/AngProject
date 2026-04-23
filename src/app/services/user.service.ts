import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { delay, Observable, of } from 'rxjs';
import { AuthStore, SessionUser } from './auth.store';
import { environment } from '../../environments/environment';
import { buildMockKpis, normalizeMockSessionUser } from './mock-auth';

export type UserDTO = { id: number | string; name: string; email: string; role: string };
export type KpiDTO = { myOpen: number; assignedToMe: number; inProgress: number; resolvedLast30d: number };

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  getMe(): Observable<SessionUser> {
    if (environment.mockAuth) {
      const user = normalizeMockSessionUser(this.store.user());
      if (!user) {
        throw new Error('Mock user nao encontrado');
      }

      const token = localStorage.getItem('auth_token') ?? 'mock-token';
      this.store.setSession(token, user);
      return of(user).pipe(delay(200));
    }

    return this.http.get<UserDTO>('/user').pipe(
      map(dto => ({
        id: String(dto.id),
        name: dto.name,
        email: dto.email,
        roles: [dto.role],
        avatarUrl: null
      })),
      tap(user => {
        const token = localStorage.getItem('auth_token')!;
        this.store.setSession(token, user);
      })
    );
  }

  updateMe(payload: { name: string; avatarUrl?: string | null }) {
    if (environment.mockAuth) {
      const current = this.store.user();
      const updated: SessionUser = {
        id: current?.id ?? String(Date.now()),
        name: payload.name,
        email: current?.email ?? 'mock@example.com',
        roles: current?.roles ?? ['USER'],
        avatarUrl: payload.avatarUrl ?? current?.avatarUrl ?? null
      };
      const token = localStorage.getItem('auth_token') ?? 'mock-token';
      this.store.setSession(token, updated);

      return of({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.roles[0]
      }).pipe(delay(200));
    }

    return this.http.put<UserDTO>('/user', payload).pipe(
      tap(dto => {
        const updated: SessionUser = {
          id: String(dto.id),
          name: dto.name,
          email: dto.email,
          roles: [dto.role],
          avatarUrl: payload.avatarUrl ?? this.store.user()?.avatarUrl ?? null
        };
        const token = localStorage.getItem('auth_token')!;
        this.store.setSession(token, updated);
      })
    );
  }

  getKpis(): Observable<KpiDTO> {
    if (environment.mockAuth) {
      return of(buildMockKpis(this.store.user())).pipe(delay(180));
    }

    return this.http.get<KpiDTO>('/api/kpis');
  }
}

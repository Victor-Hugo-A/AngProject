import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthStore, SessionUser } from './auth.store';

export type UserDTO = { id: number | string; name: string; email: string; role: string };
export type KpiDTO = { myOpen: number; assignedToMe: number; inProgress: number; resolvedLast30d: number };

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private store: AuthStore) {}

  getMe(): Observable<SessionUser> {
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

  // PUT /user: { name } -> UserDTO (implemente no backend)
  updateMe(payload: { name: string }) {
    return this.http.put<UserDTO>('/user', payload).pipe(
      tap(dto => {
        const updated: SessionUser = {
          id: String(dto.id),
          name: dto.name,
          email: dto.email,
          roles: [dto.role],
          avatarUrl: null
        };
        const token = localStorage.getItem('auth_token')!;
        this.store.setSession(token, updated);
      })
    );
  }

  // KPIs da dashboard (/api/kpis)
  getKpis(): Observable<KpiDTO> {
    return this.http.get<KpiDTO>('/api/kpis');
  }
}

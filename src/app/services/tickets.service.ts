import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Ticket = {
  id: number;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category_id?: number;
  assignee_id?: number;
  requester_id?: number;
  created_at?: string;
  updated_at?: string;
  closed_at?: string | null;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // página atual
  size: number;
};

export type Category = { id: number; name: string; };
export type KpiDTO   = { myOpen: number; assignedToMe: number; inProgress: number; resolvedLast30d: number; };

@Injectable({ providedIn: 'root' })
export class TicketsService {
  constructor(private http: HttpClient) {}

  list(params: {
    status?: string; priority?: string; category?: number;
    assigneeId?: number; requesterId?: number;
    page?: number; size?: number; sort?: string;
  }): Observable<Page<Ticket>> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<Page<Ticket>>('/api/tickets', { params: p });
  }

  create(dto: { title: string; description?: string; priority: 'LOW'|'MEDIUM'|'HIGH'; categoryId?: number; }) {
    const body = {
      title: dto.title,
      description: dto.description ?? '',
      priority: dto.priority,
      categoryId: dto.categoryId ?? null
    };
    return this.http.post<Ticket>('/api/tickets', body);
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories');
  }

  kpis(): Observable<KpiDTO> {
    return this.http.get<KpiDTO>('/api/kpis');
  }
}

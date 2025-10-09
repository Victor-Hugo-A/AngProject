import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export type Category = { id: number; name: string };

export type Ticket = {
  id: number;
  title: string;
  description?: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: Category | null;
  requesterId: number;
  assigneeId?: number | null;
  created_at: string;
  updated_at: string;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
};

export type TicketCreate = {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  categoryId?: number;
};

@Injectable({ providedIn: 'root' })
export class TicketsService {
  constructor(private http: HttpClient) {}

  list(params: {
    status?: string; priority?: string; category?: number;
    assigneeId?: number; requesterId?: number;
    page?: number; size?: number; sort?: string;
  }) {
    return this.http.get<Page<Ticket>>('/api/tickets', { params: toParams(params) });
  }

  get(id: number)            { return this.http.get<Ticket>(`/api/tickets/${id}`); }
  create(dto: TicketCreate)  { return this.http.post<Ticket>('/api/tickets', dto); }
  update(id: number, dto: Partial<TicketCreate>) { return this.http.put<Ticket>(`/api/tickets/${id}`, dto); }

  changeStatus(id: number, status: Ticket['status']) {
    return this.http.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  }

  // se no backend você aceitar "me" e resolver pelo usuário do token:
  assignToMe(id: number) {
    return this.http.patch<Ticket>(`/api/tickets/${id}/assignee`, { assigneeId: 'me' as any });
  }

  categories() { return this.http.get<Category[]>('/api/categories'); }
}

function toParams(o: any) {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(o ?? {})) {
    if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
  }
  return p;
}

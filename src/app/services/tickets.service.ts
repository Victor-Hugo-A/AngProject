import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type Category = { id: number; name: string };

export type TicketHistoryEntry = {
  type: 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED';
  message: string;
  created_at: string;
};

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
  history?: TicketHistoryEntry[];
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

type TicketListParams = {
  status?: string;
  priority?: string;
  category?: number;
  assigneeId?: number;
  requesterId?: number;
  page?: number;
  size?: number;
  sort?: string;
};

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Acesso' },
  { id: 2, name: 'Hardware' },
  { id: 3, name: 'Software' },
  { id: 4, name: 'Rede' }
];

const MOCK_TICKETS_KEY = 'mock_tickets';
const MOCK_CURRENT_USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  constructor(private http: HttpClient) {}

  list(params: TicketListParams) {
    if (environment.mockAuth) {
      return of(this.mockList(params)).pipe(delay(180));
    }

    return this.http.get<Page<Ticket>>('/api/tickets', { params: toParams(params) });
  }

  get(id: number) {
    if (environment.mockAuth) {
      const ticket = readMockTickets().find(item => item.id === id);
      return ticket
        ? of(ticket).pipe(delay(150))
        : throwError(() => ({ status: 404, message: 'Ticket nao encontrado' }));
    }

    return this.http.get<Ticket>(`/api/tickets/${id}`);
  }

  create(dto: TicketCreate) {
    if (environment.mockAuth) {
      const tickets = readMockTickets();
      const currentUser = readCurrentUser();
      const category = MOCK_CATEGORIES.find(item => item.id === dto.categoryId) ?? null;
      const now = new Date().toISOString();

      const ticket: Ticket = {
        id: nextTicketId(tickets),
        title: dto.title,
        description: dto.description ?? '',
        status: 'OPEN',
        priority: dto.priority ?? 'MEDIUM',
        category,
        requesterId: Number(currentUser?.id ?? 1),
        assigneeId: null,
        created_at: now,
        updated_at: now,
        history: [
          {
            type: 'CREATED',
            message: 'Chamado criado e enviado para triagem.',
            created_at: now
          }
        ]
      };

      tickets.unshift(ticket);
      writeMockTickets(tickets);
      return of(ticket).pipe(delay(180));
    }

    return this.http.post<Ticket>('/api/tickets', dto);
  }

  update(id: number, dto: Partial<TicketCreate>) {
    if (environment.mockAuth) {
      const tickets = readMockTickets();
      const index = tickets.findIndex(item => item.id === id);
      if (index < 0) {
        return throwError(() => ({ status: 404, message: 'Ticket nao encontrado' }));
      }

      const current = tickets[index];
      const updated: Ticket = {
        ...current,
        title: dto.title ?? current.title,
        description: dto.description ?? current.description,
        priority: dto.priority ?? current.priority,
        category: dto.categoryId ? (MOCK_CATEGORIES.find(item => item.id === dto.categoryId) ?? current.category) : current.category,
        updated_at: new Date().toISOString()
      };

      tickets[index] = updated;
      writeMockTickets(tickets);
      return of(updated).pipe(delay(180));
    }

    return this.http.put<Ticket>(`/api/tickets/${id}`, dto);
  }

  changeStatus(id: number, status: Ticket['status']) {
    if (environment.mockAuth) {
      return this.updateMockTicket(id, ticket => {
        const now = new Date().toISOString();
        const previousStatus = ticket.status;

        return {
          ...ticket,
          status,
          updated_at: now,
          history: appendHistory(ticket.history, {
            type: 'STATUS_CHANGED',
            message: buildStatusMessage(previousStatus, status),
            created_at: now
          })
        };
      });
    }

    return this.http.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  }

  assignToMe(id: number) {
    if (environment.mockAuth) {
      const currentUser = readCurrentUser();
      return this.updateMockTicket(id, ticket => {
        const now = new Date().toISOString();
        const assigneeId = Number(currentUser?.id ?? 1);

        return {
          ...ticket,
          assigneeId,
          updated_at: now,
          history: appendHistory(ticket.history, {
            type: 'ASSIGNED',
            message: `Chamado atribuido ao responsavel #${assigneeId}.`,
            created_at: now
          })
        };
      });
    }

    return this.http.patch<Ticket>(`/api/tickets/${id}/assignee`, { assigneeId: 'me' as any });
  }

  categories() {
    if (environment.mockAuth) {
      return of(MOCK_CATEGORIES).pipe(delay(120));
    }

    return this.http.get<Category[]>('/api/categories');
  }

  private mockList(params: TicketListParams): Page<Ticket> {
    const page = params.page ?? 0;
    const size = params.size ?? 10;

    let filtered = [...readMockTickets()];

    if (params.status) {
      filtered = filtered.filter(ticket => ticket.status === params.status);
    }

    if (params.priority) {
      filtered = filtered.filter(ticket => ticket.priority === params.priority);
    }

    if (params.category) {
      filtered = filtered.filter(ticket => ticket.category?.id === Number(params.category));
    }

    if (params.assigneeId) {
      filtered = filtered.filter(ticket => ticket.assigneeId === Number(params.assigneeId));
    }

    if (params.requesterId) {
      filtered = filtered.filter(ticket => ticket.requesterId === Number(params.requesterId));
    }

    filtered.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return { content, totalPages, totalElements };
  }

  private updateMockTicket(id: number, updater: (ticket: Ticket) => Ticket): Observable<Ticket> {
    const tickets = readMockTickets();
    const index = tickets.findIndex(item => item.id === id);
    if (index < 0) {
      return throwError(() => ({ status: 404, message: 'Ticket nao encontrado' }));
    }

    const updated = updater(tickets[index]);
    tickets[index] = updated;
    writeMockTickets(tickets);
    return of(updated).pipe(delay(150));
  }
}

function toParams(o: Record<string, unknown>) {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(o ?? {})) {
    if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
  }
  return p;
}

function readMockTickets(): Ticket[] {
  const raw = localStorage.getItem(MOCK_TICKETS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Ticket[];
    } catch {
      localStorage.removeItem(MOCK_TICKETS_KEY);
    }
  }

  const seed = buildSeedTickets();
  writeMockTickets(seed);
  return seed;
}

function writeMockTickets(tickets: Ticket[]) {
  localStorage.setItem(MOCK_TICKETS_KEY, JSON.stringify(tickets));
}

function nextTicketId(tickets: Ticket[]) {
  return tickets.reduce((max, ticket) => Math.max(max, ticket.id), 0) + 1;
}

function readCurrentUser(): { id?: string; roles?: string[] } | null {
  const raw = localStorage.getItem(MOCK_CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { id?: string; roles?: string[] };
  } catch {
    return null;
  }
}

function appendHistory(history: TicketHistoryEntry[] | undefined, entry: TicketHistoryEntry) {
  return [...(history ?? []), entry];
}

function buildStatusMessage(previousStatus: Ticket['status'], nextStatus: Ticket['status']) {
  const previousLabel = statusLabel(previousStatus);
  const nextLabel = statusLabel(nextStatus);

  if (previousStatus === nextStatus) {
    return `Status mantido como ${nextLabel}.`;
  }

  return `Status alterado de ${previousLabel} para ${nextLabel}.`;
}

function statusLabel(status: Ticket['status']) {
  switch (status) {
    case 'OPEN':
      return 'aberto';
    case 'IN_PROGRESS':
      return 'em andamento';
    case 'RESOLVED':
      return 'resolvido';
    case 'CLOSED':
      return 'fechado';
  }
}

function buildSeedTickets(): Ticket[] {
  const now = Date.now();
  return [
    {
      id: 1001,
      title: 'VPN corporativa sem conectar',
      description: 'Usuarios do financeiro nao conseguem autenticar na VPN desde o inicio da manha.',
      status: 'OPEN',
      priority: 'HIGH',
      category: MOCK_CATEGORIES[3],
      requesterId: 1,
      assigneeId: null,
      created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 45).toISOString(),
      history: [
        {
          type: 'CREATED',
          message: 'Chamado criado e enviado para triagem.',
          created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString()
        }
      ]
    },
    {
      id: 1002,
      title: 'Notebook com lentidao extrema',
      description: 'Equipamento demorando mais de 15 minutos para iniciar.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: MOCK_CATEGORIES[1],
      requesterId: 2,
      assigneeId: 7,
      created_at: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 30).toISOString(),
      history: [
        {
          type: 'CREATED',
          message: 'Chamado criado e enviado para triagem.',
          created_at: new Date(now - 1000 * 60 * 60 * 8).toISOString()
        },
        {
          type: 'ASSIGNED',
          message: 'Chamado atribuido ao responsavel #7.',
          created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          type: 'STATUS_CHANGED',
          message: 'Status alterado de aberto para em andamento.',
          created_at: new Date(now - 1000 * 60 * 30).toISOString()
        }
      ]
    },
    {
      id: 1003,
      title: 'Erro ao acessar ERP',
      description: 'Mensagem de permissao insuficiente ao abrir o modulo fiscal.',
      status: 'RESOLVED',
      priority: 'HIGH',
      category: MOCK_CATEGORIES[2],
      requesterId: 3,
      assigneeId: 7,
      created_at: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      history: [
        {
          type: 'CREATED',
          message: 'Chamado criado e enviado para triagem.',
          created_at: new Date(now - 1000 * 60 * 60 * 30).toISOString()
        },
        {
          type: 'ASSIGNED',
          message: 'Chamado atribuido ao responsavel #7.',
          created_at: new Date(now - 1000 * 60 * 60 * 20).toISOString()
        },
        {
          type: 'STATUS_CHANGED',
          message: 'Status alterado de aberto para em andamento.',
          created_at: new Date(now - 1000 * 60 * 60 * 10).toISOString()
        },
        {
          type: 'STATUS_CHANGED',
          message: 'Status alterado de em andamento para resolvido.',
          created_at: new Date(now - 1000 * 60 * 60 * 4).toISOString()
        }
      ]
    },
    {
      id: 1004,
      title: 'Solicitacao de novo acesso ao e-mail',
      description: 'Novo colaborador precisa de acesso ao correio corporativo.',
      status: 'CLOSED',
      priority: 'LOW',
      category: MOCK_CATEGORIES[0],
      requesterId: 4,
      assigneeId: 8,
      created_at: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      updated_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      history: [
        {
          type: 'CREATED',
          message: 'Chamado criado e enviado para triagem.',
          created_at: new Date(now - 1000 * 60 * 60 * 48).toISOString()
        },
        {
          type: 'ASSIGNED',
          message: 'Chamado atribuido ao responsavel #8.',
          created_at: new Date(now - 1000 * 60 * 60 * 40).toISOString()
        },
        {
          type: 'STATUS_CHANGED',
          message: 'Status alterado de aberto para fechado.',
          created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString()
        }
      ]
    }
  ];
}

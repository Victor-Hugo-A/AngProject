import { AuthPayload } from './login.service';
import { KpiDTO } from './user.service';
import { SessionUser } from './auth.store';

type MockRole = 'USER' | 'SUPPORT' | 'ADMIN';
type MockTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type MockTicket = {
  id: number;
  status: MockTicketStatus;
  requesterId: number;
  assigneeId?: number | null;
  updated_at: string;
};

const MOCK_TICKETS_KEY = 'mock_tickets';

export function buildMockAuthPayload(email: string, name?: string): AuthPayload {
  const normalizedEmail = email.trim().toLowerCase();
  const role = inferRole(normalizedEmail);

  return {
    token: `mock-token-${Date.now()}`,
    user: {
      id: inferStableUserId(normalizedEmail, role),
      name: name?.trim() || inferName(normalizedEmail),
      email: normalizedEmail,
      role
    }
  };
}

export function normalizeMockSessionUser(user: SessionUser | null): SessionUser | null {
  if (!user) return null;

  const email = user.email.trim().toLowerCase();
  const role = inferRole(email);
  const previousId = Number(user.id);
  const normalizedId = String(inferStableUserId(email, role));

  if (String(user.id) === normalizedId) {
    return user;
  }

  migrateMockTicketOwnership(previousId, Number(normalizedId));

  return {
    ...user,
    id: normalizedId,
    roles: user.roles?.length ? user.roles : [role]
  };
}

export function buildMockKpis(user: SessionUser | null): KpiDTO {
  const normalizedUser = normalizeMockSessionUser(user);
  const userId = Number(normalizedUser?.id ?? 0);
  const tickets = readMockTickets();

  return {
    myOpen: tickets.filter(ticket => ticket.requesterId === userId && ticket.status === 'OPEN').length,
    assignedToMe: tickets.filter(ticket => ticket.assigneeId === userId).length,
    inProgress: tickets.filter(ticket => ticket.status === 'IN_PROGRESS').length,
    resolvedLast30d: tickets.filter(ticket => ticket.status === 'RESOLVED').length
  };
}

function inferRole(email: string): MockRole {
  if (email.includes('admin')) return 'ADMIN';
  if (email.includes('support') || email.includes('suporte')) return 'SUPPORT';
  return 'USER';
}

function inferStableUserId(email: string, role: MockRole): number {
  if (role === 'ADMIN') return 8;
  if (role === 'SUPPORT') return 7;

  let hash = 0;
  for (const char of email) {
    hash = (hash * 31 + char.charCodeAt(0)) % 4;
  }

  return hash + 1;
}

function inferName(email: string): string {
  const localPart = email.split('@')[0] || 'usuario';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function readMockTickets(): MockTicket[] {
  const raw = localStorage.getItem(MOCK_TICKETS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as MockTicket[];
  } catch {
    return [];
  }
}

function migrateMockTicketOwnership(previousId: number, normalizedId: number) {
  if (!previousId || previousId === normalizedId) return;

  const tickets = readMockTickets();
  let changed = false;

  const migrated = tickets.map(ticket => {
    let nextTicket = ticket;

    if (ticket.requesterId === previousId) {
      nextTicket = { ...nextTicket, requesterId: normalizedId };
      changed = true;
    }

    if (ticket.assigneeId === previousId) {
      nextTicket = { ...nextTicket, assigneeId: normalizedId };
      changed = true;
    }

    return nextTicket;
  });

  if (changed) {
    localStorage.setItem(MOCK_TICKETS_KEY, JSON.stringify(migrated));
  }
}

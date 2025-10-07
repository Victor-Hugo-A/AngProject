import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type KpiOverview = {
  myOpen: number;
  assignedToMe: number;
  inProgress: number;
  resolved30d: number;
};

@Injectable({ providedIn: 'root' })
export class KpiService {
  private http = inject(HttpClient);

  getOverview() {
    // URL relativa → passa pelo proxy para http://localhost:8080/api/kpis
    return firstValueFrom(this.http.get<KpiOverview>('/api/kpis'));
  }
}

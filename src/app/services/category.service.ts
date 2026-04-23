import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type Category = { id: number; name: string };

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = 'http://localhost:8080/api/categories'; // ajuste se for diferente

  constructor(private http: HttpClient) {}

  list(): Observable<Category[]> {
    if (environment.mockAuth) {
      return of([
        { id: 1, name: 'Acesso' },
        { id: 2, name: 'Hardware' },
        { id: 3, name: 'Software' },
        { id: 4, name: 'Rede' }
      ]).pipe(delay(120));
    }

    return this.http.get<Category[]>(this.API);
  }
}

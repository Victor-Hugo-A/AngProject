import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Category = { id: number; name: string };

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = 'http://localhost:8080/api/categories'; // ajuste se for diferente

  constructor(private http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.API);
  }
}

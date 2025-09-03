import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../model/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private baseUrl = 'http://localhost:8084/api/clients';

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  updateClient(id: string, name: string): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, { name });
  }
  addClient(name: string): Observable<Client> {
  return this.http.post<Client>(this.baseUrl, { name });
}
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FieldService {
  private baseUrl = 'https://ketsan.mnhduc.site/api/Field';

  constructor(private http: HttpClient) {}

  getFields(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl, { headers });
  }
}

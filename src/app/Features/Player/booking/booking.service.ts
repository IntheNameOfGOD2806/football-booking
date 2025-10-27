import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = 'https://ketsan.mnhduc.site/api/Booking'; 

  constructor(private http: HttpClient) {}

  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  getUserBookings(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  getAllFields(): Observable<any> {
    return this.http.get('https://ketsan.mnhduc.site/api/Field');
  }
}

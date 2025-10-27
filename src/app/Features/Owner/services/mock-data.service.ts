import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Field, Booking, DashboardStats } from '../models/field.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private fields: Field[] = [
    {
      id: '1',
      name: 'Greenfield Soccer Arena',
      type: 'football',
      description: 'Professional grass football field with lights',
      pricePerHour: 50,
      capacity: 22,
      amenities: ['Lighting', 'Parking', 'Locker Rooms', 'Shower'],
      imageUrl: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'active',
      address: '123 Sports Ave, City',
      operatingHours: { start: '08:00', end: '22:00' },
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Downtown Basketball Court',
      type: 'basketball',
      description: 'Indoor basketball court with air conditioning',
      pricePerHour: 40,
      capacity: 10,
      amenities: ['Air Conditioning', 'Parking', 'Water Fountain'],
      imageUrl: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'active',
      address: '456 Downtown Rd, City',
      operatingHours: { start: '07:00', end: '23:00' },
      createdAt: new Date('2024-02-20')
    },
    {
      id: '3',
      name: 'Elite Tennis Complex',
      type: 'tennis',
      description: 'Clay tennis courts with professional equipment',
      pricePerHour: 35,
      capacity: 4,
      amenities: ['Equipment Rental', 'Coaching Available', 'Parking'],
      imageUrl: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'active',
      address: '789 Tennis Lane, City',
      operatingHours: { start: '06:00', end: '20:00' },
      createdAt: new Date('2024-03-10')
    },
    {
      id: '4',
      name: 'Beach Volleyball Court',
      type: 'volleyball',
      description: 'Sand volleyball court near the beach',
      pricePerHour: 30,
      capacity: 12,
      amenities: ['Beach Access', 'Parking', 'Changing Rooms'],
      imageUrl: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'maintenance',
      address: '321 Beach Blvd, City',
      operatingHours: { start: '09:00', end: '19:00' },
      createdAt: new Date('2024-04-05')
    }
  ];

  private bookings: Booking[] = [
    {
      id: 'B001',
      fieldId: '1',
      fieldName: 'Greenfield Soccer Arena',
      playerName: 'John Smith',
      playerEmail: 'john@email.com',
      playerPhone: '+1234567890',
      date: new Date('2025-10-15'),
      startTime: '14:00',
      endTime: '16:00',
      duration: 2,
      totalPrice: 100,
      status: 'confirmed',
      createdAt: new Date('2025-10-13')
    },
    {
      id: 'B002',
      fieldId: '2',
      fieldName: 'Downtown Basketball Court',
      playerName: 'Mike Johnson',
      playerEmail: 'mike@email.com',
      playerPhone: '+1234567891',
      date: new Date('2025-10-14'),
      startTime: '18:00',
      endTime: '20:00',
      duration: 2,
      totalPrice: 80,
      status: 'confirmed',
      createdAt: new Date('2025-10-12')
    },
    {
      id: 'B003',
      fieldId: '1',
      fieldName: 'Greenfield Soccer Arena',
      playerName: 'Sarah Williams',
      playerEmail: 'sarah@email.com',
      playerPhone: '+1234567892',
      date: new Date('2025-10-16'),
      startTime: '10:00',
      endTime: '12:00',
      duration: 2,
      totalPrice: 100,
      status: 'pending',
      createdAt: new Date('2025-10-13')
    },
    {
      id: 'B004',
      fieldId: '3',
      fieldName: 'Elite Tennis Complex',
      playerName: 'David Brown',
      playerEmail: 'david@email.com',
      playerPhone: '+1234567893',
      date: new Date('2025-10-13'),
      startTime: '09:00',
      endTime: '10:00',
      duration: 1,
      totalPrice: 35,
      status: 'completed',
      createdAt: new Date('2025-10-10')
    },
    {
      id: 'B005',
      fieldId: '2',
      fieldName: 'Downtown Basketball Court',
      playerName: 'Emily Davis',
      playerEmail: 'emily@email.com',
      playerPhone: '+1234567894',
      date: new Date('2025-10-17'),
      startTime: '16:00',
      endTime: '18:00',
      duration: 2,
      totalPrice: 80,
      status: 'confirmed',
      createdAt: new Date('2025-10-13')
    }
  ];

  getFields(): Observable<Field[]> {
    return of(this.fields).pipe(delay(300));
  }

  getFieldById(id: string): Observable<Field | undefined> {
    return of(this.fields.find(f => f.id === id)).pipe(delay(300));
  }

  addField(field: Field): Observable<Field> {
    this.fields.push(field);
    return of(field).pipe(delay(300));
  }

  updateField(field: Field): Observable<Field> {
    const index = this.fields.findIndex(f => f.id === field.id);
    if (index !== -1) {
      this.fields[index] = field;
    }
    return of(field).pipe(delay(300));
  }

  deleteField(id: string): Observable<boolean> {
    const index = this.fields.findIndex(f => f.id === id);
    if (index !== -1) {
      this.fields.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  getBookings(): Observable<Booking[]> {
    return of(this.bookings).pipe(delay(300));
  }

  getBookingsByFieldId(fieldId: string): Observable<Booking[]> {
    return of(this.bookings.filter(b => b.fieldId === fieldId)).pipe(delay(300));
  }

  updateBookingStatus(bookingId: string, status: Booking['status']): Observable<Booking | undefined> {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
    }
    return of(booking).pipe(delay(300));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const stats: DashboardStats = {
      totalFields: this.fields.length,
      activeBookings: this.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
      monthlyRevenue: this.bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      totalBookings: this.bookings.length
    };
    return of(stats).pipe(delay(300));
  }
}

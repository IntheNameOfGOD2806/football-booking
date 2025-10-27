import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MockDataService } from '../../services/mock-data.service';
import { Booking } from '../../models/field.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatMenuModule
  ],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  allBookings: Booking[] = [];
  displayedColumns: string[] = ['id', 'fieldName', 'playerName', 'contact', 'date', 'time', 'price', 'status', 'actions'];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.mockDataService.getBookings().subscribe(bookings => {
      this.allBookings = bookings;
    });
  }

  get pendingBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'pending');
  }

  get confirmedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'confirmed');
  }

  get completedBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'completed');
  }

  get cancelledBookings(): Booking[] {
    return this.allBookings.filter(b => b.status === 'cancelled');
  }

  updateStatus(bookingId: string, status: Booking['status']) {
    this.mockDataService.updateBookingStatus(bookingId, status).subscribe(() => {
      this.loadBookings();
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#ff9800',
      'confirmed': '#4caf50',
      'completed': '#2196f3',
      'cancelled': '#f44336'
    };
    return colors[status] || '#757575';
  }
}

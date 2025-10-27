import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MockDataService } from '../../services/mock-data.service';
import { Field, Booking } from '../../models/field.model';

interface FieldStats {
  fieldName: string;
  totalBookings: number;
  revenue: number;
  avgRating: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  totalRevenue = 0;
  totalBookings = 0;
  avgBookingValue = 0;
  fieldStats: FieldStats[] = [];
  recentBookings: Booking[] = [];
  displayedColumns: string[] = ['fieldName', 'totalBookings', 'revenue'];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.mockDataService.getBookings().subscribe(bookings => {
      this.totalBookings = bookings.length;
      this.totalRevenue = bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      this.avgBookingValue = this.totalBookings > 0 ? this.totalRevenue / this.totalBookings : 0;
      this.recentBookings = bookings.slice(-5).reverse();

      const fieldMap = new Map<string, FieldStats>();
      bookings.forEach(booking => {
        if (!fieldMap.has(booking.fieldId)) {
          fieldMap.set(booking.fieldId, {
            fieldName: booking.fieldName,
            totalBookings: 0,
            revenue: 0,
            avgRating: 4.5
          });
        }
        const stats = fieldMap.get(booking.fieldId)!;
        stats.totalBookings++;
        if (booking.status === 'completed' || booking.status === 'confirmed') {
          stats.revenue += booking.totalPrice;
        }
      });

      this.fieldStats = Array.from(fieldMap.values()).sort((a, b) => b.revenue - a.revenue);
    });
  }
}

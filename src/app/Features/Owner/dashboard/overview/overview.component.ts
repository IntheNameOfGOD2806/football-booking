import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { DashboardStats, Booking } from '../../models/field.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentBookings: Booking[] = [];
  displayedColumns: string[] = ['id', 'fieldName', 'playerName', 'date', 'time', 'status'];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.mockDataService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });

    this.mockDataService.getBookings().subscribe(bookings => {
      this.recentBookings = bookings.slice(0, 5);
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
// dashboard.component.ts
export class DashboardLayoutComponent {
  menuItems = [
    { path: 'overview',  icon: 'dashboard',     label: 'Overview' },
    { path: 'fields',    icon: 'sports_soccer', label: 'My Fields' },
    { path: 'bookings',  icon: 'event',         label: 'Bookings' },
    { path: 'analytics', icon: 'analytics',     label: 'Analytics' },
    { path: 'settings',  icon: 'settings',      label: 'Settings' },
  ];
}



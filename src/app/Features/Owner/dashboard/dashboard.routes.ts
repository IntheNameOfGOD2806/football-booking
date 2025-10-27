import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'fields',
        loadComponent: () => import('./fields/field-list.component').then(m => m.FieldListComponent)
      },
      {
        path: 'fields/add',
        loadComponent: () => import('./fields/field-form.component').then(m => m.FieldFormComponent)
      },
      {
        path: 'fields/edit/:id',
        loadComponent: () => import('./fields/field-form.component').then(m => m.FieldFormComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./bookings/bookings.component').then(m => m.BookingsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  }
];

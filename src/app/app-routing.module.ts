import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './Features/Player/booking/booking.component';
import { HomeComponent } from './Features/Player/home/home.component';
import { LoginComponent } from './Features/Player/login/login.component';
import { RegisterComponent } from './Features/Player/register/register.component';
import { AuthGuard } from './Features/Player/auth/auth.guard';
import { RoleGuard } from './Features/Player/auth/role.guard';
import { CheckEmailComponent } from './Features/Player/check-email/check-email.component'; 
import { VerifyEmailComponent } from './Features/Player/verify-email/verify-email.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'check-email', component: CheckEmailComponent }, 
  { path: 'verify', component: VerifyEmailComponent },


  // PLAYER area
  { path: 'home',    component: HomeComponent,    canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'user' } },
  { path: 'booking', component: BookingComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'user' } },

  // OWNER area
  {
    path: 'owner',
    canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'staff' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // /owner -> /owner/dashboard
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./Features/Owner/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

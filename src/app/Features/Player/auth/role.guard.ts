import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = route.data['expectedRole'] as UserRole | undefined;

    // Chưa đăng nhập → đẩy về /login (AuthGuard của bạn cũng xử lý, nhưng để chắc)
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return false;
    }

    // Không cấu hình expectedRole thì coi như pass
    if (!expected) return true;

    const userRole = this.auth.getRole();
    if (userRole === expected) return true;

    // Sai role → điều hướng về khu đúng
    if (userRole === 'owner') this.router.navigateByUrl('/owner/dashboard');
    else this.router.navigateByUrl('/home');
    return false;
  }
}

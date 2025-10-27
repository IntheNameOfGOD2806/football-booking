import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          return this.authService.refreshToken().pipe(
            switchMap((newToken) => {
              this.isRefreshing = false;
              if (newToken) {
                const newReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next.handle(newReq);
              } else {
                this.authService.logout();
                return throwError(() => error);
              }
            }),
            catchError(refreshErr => {
              this.isRefreshing = false;
              console.error('❌ Refresh token failed:', refreshErr);

            // ✅ Nếu refresh lỗi (hết hạn hoặc bị revoke) thì logout ngay
            this.authService.logout();
              return throwError(() => refreshErr);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}

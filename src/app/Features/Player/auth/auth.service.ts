import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';


export type UserRole = 'player' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; 
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

@Injectable({ providedIn: 'root'})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
  const savedUser = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');
  if (token) this.scheduleAutoRefresh(token);
  if (savedUser) this.currentUserSubject.next(JSON.parse(savedUser));
}

private apiUrl = 'https://ketsan.mnhduc.site/api/Authentication';
/** Nhận diện role: email có “đuôi owner” → owner, ngược lại player.
   *  Quy tắc demo: phần username trước @ chứa "+owner" hoặc ".owner"
   *  Ví dụ: hoang+owner@gmail.com | hoang.owner@gmail.com
   *  (Khi lên API thật, trả role từ server thay vì suy luận client.)
   */
  private detectRole(email: string): UserRole {
    const userPart = email.split('@')[0].toLowerCase();
    return (userPart.endsWith('+owner') || userPart.endsWith('.owner')) ? 'owner' : 'player';
  }

  login(email: string, password: string): Observable<boolean> {
  const body = { email, password };

  return new Observable<boolean>(observer => {
    this.http.post<any>('https://ketsan.mnhduc.site/api/Authentication/login', body)
      .subscribe({
        next: (res) => {
          console.log('API Login Response:', res);

          // ✅ Sửa điều kiện ở đây
          const token = res?.returnObject?.accessToken;
          const refreshToken = res?.returnObject?.refreshToken;

          if (res.isSuccess && token && refreshToken) {
            const user: User = {
              id: '1',
              email,
              name: email.split('@')[0],
              role: 'player' as UserRole
            };

            // ✅ Lưu token & refreshToken
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            this.currentUserSubject.next(user);
            this.scheduleAutoRefresh(token);
            observer.next(true);
          } else {
            console.warn('Login response invalid:', res);
            observer.next(false);
          }

          observer.complete();
        },
        error: (err) => {
          console.error('Login API Error:', err);
          observer.next(false);
          observer.complete();
        }
      });
  });
}


refreshToken(): Observable<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return of(null);

  return this.http.post<any>('http://18.143.220.111/RefreshToken', {
    refreshToken
  }).pipe(
    map(res => {
      const newToken = res?.returnObject?.accessToken;
      if (newToken) {
        localStorage.setItem('token', newToken);
        console.log('✅ Token refreshed successfully');
        return newToken;
      } else {
        console.warn('⚠️ Refresh failed: no new token returned');
        return null;
      }
    }),
    catchError(err => {
      console.error('❌ Refresh token error:', err);
      this.logout(); // logout nếu refresh lỗi
      return of(null);
    })
  );
}


  register(registerData: RegisterData): Observable<boolean> {
  return this.http.post<any>('https://ketsan.mnhduc.site/api/Authentication/register', registerData)
    .pipe(
      map(res => {
        if (res.isSuccess) {
          console.log('✅ Register success. Please check your email to confirm.');
          return true;
        } else {
          console.warn('⚠️ Register failed:', res);
          return false;
        }
      }),
      catchError(err => {
        console.error('❌ Register API error:', err);
        return of(false);
      })
    );
}


  logout(): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  this.currentUserSubject.next(null);
  window.location.href = '/login'; 
  }

    private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
//refresh token tự động trước khi hết hạn
  private refreshTimer: any;

private scheduleAutoRefresh(token: string) {
  const decoded = this.decodeToken(token);
  if (!decoded || !decoded.exp) return;

  const exp = decoded.exp * 1000; // convert sang ms
  const now = Date.now();
  const timeout = exp - now - 60 * 1000; // refresh trước 1 phút

  if (timeout <= 0) return; // Token đã gần hết hạn rồi

  // Hủy timer cũ nếu có
  if (this.refreshTimer) clearTimeout(this.refreshTimer);

  console.log(`🕒 Token sẽ được tự động refresh sau ${(timeout / 1000 / 60).toFixed(1)} phút`);

  this.refreshTimer = setTimeout(() => {
    console.log('♻️ Đang tự động refresh token...');
    this.refreshToken().subscribe((newToken) => {
      if (newToken) this.scheduleAutoRefresh(newToken); // Lập lại chu kỳ
    });
  }, timeout);
}


  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  isOwner(): boolean {
    return this.getRole() === 'owner';
  }
}
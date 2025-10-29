// ----------------------------------------------------
// ## 0. Imports
// ----------------------------------------------------

// 1. Angular Core & Common Modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 2. RxJS Core (Observable, Subject)
import { BehaviorSubject, Observable, of } from 'rxjs'; // of vẫn cần cho catchError

// 3. RxJS Operators
// CHÚ Ý: Giữ lại 'of' từ 'rxjs' cho các trường hợp catchError(err => of(false/null)). 
// BỎ 'map' khỏi 'rxjs' vì đã dùng 'map' từ 'rxjs/operators'.
import { catchError, map, switchMap, tap } from 'rxjs/operators'; 

// ----------------------------------------------------
// ## 1. Interfaces (Giao diện Dữ liệu)
// ----------------------------------------------------

export type UserRole = 'user' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: number;
  role: UserRole; 
  // Bổ sung:
  // isVerified?: boolean; 
}

export interface RegisterData {
  // Thay thế các trường cũ bằng tên trường của API
  fullName: string;      // Sửa từ 'name' thành 'fullName'
  email: string;
  password: string;
  phoneNumber: string;   // Sửa từ 'phone' thành 'phoneNumber'
  confirmPassword: string; // BỔ SUNG TRƯỜNG NÀY
}

// ----------------------------------------------------
// ## 2. Auth Service
// ----------------------------------------------------

@Injectable({ providedIn: 'root'})
export class AuthService {
  // ----------------------------------------------------
  // 2.1. Properties (Private trước, Public sau)
  // ----------------------------------------------------
  private refreshTimer: any;
  
  // Endpoint URL chính
  private apiUrl = 'https://ketsan.mnhduc.site/api/Authentication';
  private getRoleUrl = 'https://ketsan.mnhduc.site/api/Token/GetRole';
  
  // Subject và Observable cho trạng thái người dùng
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // ----------------------------------------------------
  // 2.2. Constructor
  // ----------------------------------------------------
  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    // Khôi phục session từ LocalStorage khi khởi tạo Service
    if (savedUser) this.currentUserSubject.next(JSON.parse(savedUser));
    // Nếu có token, bắt đầu lên lịch tự động refresh
    if (token) this.scheduleAutoRefresh(token);
  }

  // ----------------------------------------------------
  // ## 3. Core Authentication Methods (Public)
  // ----------------------------------------------------

  /**
   * Đăng ký người dùng mới.
   * API này TỰ ĐỘNG GỬI EMAIL XÁC NHẬN.
   * @param registerData Dữ liệu đăng ký.
   * @returns Observable<boolean> true nếu API gọi thành công (2xx).
   */
  register(registerData: RegisterData): Observable<boolean> {
    const url = `${this.apiUrl}/register`;
    return this.http.post<any>(url, registerData)
      .pipe(
        map(res => {
          if (res.isSuccess) {
            // Đăng ký thành công, API đã gửi email xác nhận.
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
  
  /**
   * Đăng nhập người dùng.
   * @param email Email đăng nhập.
   * @param password Mật khẩu.
   * @returns Observable<boolean> true nếu đăng nhập thành công.
   */
  login(email: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}/login`; 
    const body = { email, password };

    return this.http.post<any>(url, body)
        .pipe(
            // Chuyển từ kết quả Login sang chuỗi lấy Role
            switchMap(res => {
                console.log('API Login Response:', res);
                const token = res?.returnObject?.accessToken;
                const refreshToken = res?.returnObject?.refreshToken;
                
                if (res.isSuccess && token && refreshToken) {
                    // 1. Lưu token/refresh token
                    localStorage.setItem('token', token);
                    localStorage.setItem('refreshToken', refreshToken);
                    this.scheduleAutoRefresh(token); 
                    
                    // 2. Gọi API GetRole
                    return this.getRoleFromApi().pipe(
                        tap(userRole => {
                            // 3. Xử lý kết quả GetRole
                            if (userRole) {
                                const user: User = {
                                    id: res.returnObject.id || '1',
                                    email,
                                    name: res.returnObject.name || email.split('@')[0],
                                    phone: res.returnObject.phoneNumber || 0,
                                    role: userRole 
                                };
                                
                                // 4. Lưu User Object và cập nhật Subject
                                localStorage.setItem('currentUser', JSON.stringify(user));
                                this.currentUserSubject.next(user);
                            } else {
                                this.logout();
                            }
                        }),
                        // Trả về boolean cuối cùng
                        map(userRole => !!userRole) 
                    );
                } else {
                    console.warn('Login failed or tokens missing:', res);
                    return of(false);
                }
            }),
            catchError(err => {
                console.error('Authentication process failed:', err);
                this.logout(); 
                return of(false);
            })
        );
}

  /**
   * XÁC NHẬN EMAIL: Gọi API Backend để kích hoạt tài khoản bằng token.
   * @param token Mã xác nhận từ URL.
   * @returns Observable<any> Phản hồi từ Backend.
   */
  verifyEmail(token: string): Observable<any> {
      // Giả định API Backend chấp nhận token qua POST Body
      const url = `${this.apiUrl}/verify-email`; 
      return this.http.post<any>(url, { token });
  }

  /**
   * Gửi refresh token để lấy access token mới.
   * @returns Observable<string | null> Token mới hoặc null.
   */
  refreshToken(): Observable<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);
    
    // NOTE: Sửa URL API Refresh Token nếu cần
    return this.http.post<any>('https://ketsan.mnhduc.site/RefreshToken', {
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

  /**
   * Đăng xuất người dùng và xóa dữ liệu cục bộ.
   */
  logout(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    // Tùy chọn: chuyển hướng sau khi logout
    // window.location.href = '/login'; 
  }
  
  // ----------------------------------------------------
  // ## 4. Getter & Status Checks (Public)
  // ----------------------------------------------------

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
    return this.getRole() === 'staff';
  }


  // ----------------------------------------------------
  // ## 5. Private Helpers (Private)
  // ----------------------------------------------------

  /**
   * Gọi API Backend để lấy role của người dùng đã đăng nhập.
   * @returns Observable<UserRole | null> Vai trò của người dùng.
   */
  private getRoleFromApi(): Observable<UserRole | null> {
    // API /GetRole là GET và không cần body
    return this.http.get<any>(this.getRoleUrl)
        .pipe(
            map(res => {
                if (res.isSuccess && res.returnObject) {
                    // Mapping giá trị API (ví dụ: "User") sang kiểu UserRole của FE
                    const roleString = res.returnObject.toLowerCase();
                    if (roleString === 'staff') {
                        return 'staff' as UserRole;
                    }
                    // Mặc định là 'user'
                    return 'user' as UserRole;
                }
                console.warn('⚠️ API GetRole failed or returned null:', res);
                return null;
            }),
            catchError(err => {
                console.error('❌ API GetRole error:', err);
                return of(null);
            })
        );
  }

  /**
   * Lên lịch tự động làm mới token trước khi hết hạn 1 phút.
   */
  private scheduleAutoRefresh(token: string) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return;

    const exp = decoded.exp * 1000; // convert sang ms
    const now = Date.now();
    const timeout = exp - now - 60 * 1000; // refresh trước 1 phút

    if (timeout <= 0) return; 

    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    console.log(`🕒 Token sẽ được tự động refresh sau ${(timeout / 1000 / 60).toFixed(1)} phút`);

    this.refreshTimer = setTimeout(() => {
      console.log('♻️ Đang tự động refresh token...');
      this.refreshToken().subscribe((newToken) => {
        if (newToken) this.scheduleAutoRefresh(newToken); 
      });
    }, timeout);
  }
  
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
  
  // Method này không được dùng trong logic login/refresh hiện tại, có thể bỏ.
  // private detectRole(email: string): UserRole {
  //   const userPart = email.split('@')[0].toLowerCase();
  //   return (userPart.endsWith('+staff') || userPart.endsWith('.staff')) ? 'staff' : 'user';
  // }
}
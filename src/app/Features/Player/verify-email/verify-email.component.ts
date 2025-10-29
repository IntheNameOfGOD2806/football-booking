import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service'; // Đảm bảo đường dẫn đúng đến AuthService

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <div class="card p-4 shadow-sm mx-auto" style="max-width: 500px;">
        <div [ngSwitch]="verificationStatus">
          
          <div *ngSwitchCase="'verifying'">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h5 class="mt-3">Đang xác minh tài khoản của bạn. Vui lòng đợi...</h5>
          </div>

          <div *ngSwitchCase="'success'">
            <h2 class="card-title text-success">✅ Kích hoạt Thành công!</h2>
            <p class="card-text lead">Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
            <p class="card-text">Bạn sẽ được chuyển hướng về trang đăng nhập sau 3 giây.</p>
            <a routerLink="/login" class="btn btn-success mt-3">Đăng nhập ngay</a>
          </div>

          <div *ngSwitchCase="'failed'">
            <h2 class="card-title text-danger">❌ Kích hoạt Thất bại</h2>
            <p class="card-text text-danger">{{ errorMessage }}</p>
            <a routerLink="/register" class="btn btn-danger mt-3">Thử đăng ký lại</a>
          </div>

        </div>
      </div>
    </div>
  `,
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  // 3 trạng thái: Đang xử lý, Thành công, Thất bại
  verificationStatus: 'verifying' | 'success' | 'failed' = 'verifying';
  errorMessage: string = 'Mã xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại.';
  
  // Thời gian chờ trước khi chuyển hướng
  private readonly REDIRECT_DELAY = 3000; 

  constructor(
    private route: ActivatedRoute, // Để lấy query parameters từ URL
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // 1. Lấy token từ URL (ví dụ: /verify?token=XYZ)
    const token = this.route.snapshot.queryParamMap.get('token'); 
    
    if (token) {
      this.verifyToken(token);
    } else {
      // Nếu không có token trong URL, báo lỗi ngay lập tức
      this.verificationStatus = 'failed';
      this.errorMessage = 'Không tìm thấy mã xác nhận trong liên kết.';
    }
  }

  verifyToken(token: string): void {
    // 2. Gọi API của Backend qua AuthService để xác nhận token
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verificationStatus = 'success';
        // 3. Tự động chuyển hướng về trang đăng nhập sau độ trễ
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, this.REDIRECT_DELAY);
      },
      error: (error) => {
        this.verificationStatus = 'failed';
        // Hiển thị thông báo lỗi chi tiết từ API nếu có
        this.errorMessage = error.error?.message || this.errorMessage; 
        console.error('Verification error:', error);
      }
    });
  }
}
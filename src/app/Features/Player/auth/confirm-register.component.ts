import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-confirm-register',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-page">
      <h2>{{ message }}</h2>
      <button *ngIf="confirmed" (click)="goLogin()">Đăng nhập</button>
    </div>
  `,
  styles: [`
    .confirm-page {
      display: flex; flex-direction: column; align-items: center;
      margin-top: 60px; text-align: center;
    }
    button {
      margin-top: 20px;
      padding: 10px 20px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class ConfirmRegisterComponent implements OnInit {
  message = 'Đang xác nhận tài khoản...';
  confirmed = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`https://ketsan.mnhduc.site/api/Authentication/confirmRegister?token=${token}`)
        .subscribe({
          next: (res: any) => {
            console.log('Confirm register response:', res);
            this.message = '✅ Tài khoản của bạn đã được kích hoạt thành công!';
            this.confirmed = true;
          },
          error: (err) => {
            console.error('Confirm register error:', err);
            this.message = '❌ Mã xác nhận không hợp lệ hoặc đã hết hạn.';
          }
        });
    } else {
      this.message = '⚠️ Không tìm thấy token xác nhận.';
    }
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}

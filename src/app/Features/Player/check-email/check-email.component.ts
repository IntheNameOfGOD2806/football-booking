import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Để sử dụng routerLink

@Component({
  selector: 'app-check-email',
  standalone: true,
  // Cần import RouterModule để dùng routerLink
  imports: [CommonModule, RouterModule], 
  // Bạn có thể dùng template inline để tiết kiệm file, hoặc dùng templateUrl
  template: `
    <div class="container text-center py-5">
      <div class="card p-4 shadow-sm mx-auto" style="max-width: 500px;">
        <h2 class="card-title text-success mb-3">🎉 Đăng ký Thành công!</h2>
        <p class="card-text lead">
          Tài khoản của bạn đã được tạo tạm thời.
        </p>
        <p class="card-text">
          Vui lòng kiểm tra hộp thư email (**bao gồm cả thư mục Spam/Quảng cáo**) mà bạn đã đăng ký để nhấp vào **liên kết xác nhận** và kích hoạt tài khoản.
        </p>
        <a routerLink="/login" class="btn btn-primary mt-4">Quay lại Trang Đăng nhập</a>
      </div>
    </div>
  `,
  styleUrls: ['./check-email.component.css']
})
export class CheckEmailComponent {
  // Không cần logic nào ở đây.
}
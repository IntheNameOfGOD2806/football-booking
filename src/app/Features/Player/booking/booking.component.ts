import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, take } from 'rxjs/operators';

// ⚠️ CẦN ĐẢM BẢO ĐƯỜNG DẪN ĐẾN SERVICE LÀ CHÍNH XÁC
// *Lưu ý*: BookingPayload đã bị loại bỏ/thay đổi trong BookingService mới
import { BookingService, Field, TimeframeAvailability, ApiResponse } from '../booking/booking.service'; 
import { AuthService } from '../auth/auth.service';

interface LocalUser {
    name: string;
    phone: string;
}
@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  selectedField: Field | null = null;
  currentUser$ = this.authService.currentUser$;
  availableTimeframes: TimeframeAvailability[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService
  ) {
    // Giữ nguyên Validators cho logic form
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      playerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{10,}$/)]],
      specialRequests: ['']
    });
  }

  ngOnInit() {
    // 1. Logic đặt ngày tối thiểu
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
    this.populateUserDataFromStorage();

    // 3. Lấy Chi Tiết Sân
    this.route.queryParams.subscribe(params => {
      const fieldId = params['fieldId'];
      if (fieldId) {
        this.fetchFieldDetails(fieldId);
      } else {
        console.error('No fieldId provided in URL.');
        this.router.navigate(['/']);
      }
    });
    
    // 4. Theo dõi sự thay đổi của trường 'date' để gọi API khung giờ
    this.bookingForm.get('date')?.valueChanges.subscribe(selectedDate => {
        if (selectedDate && this.selectedField) {
            this.fetchTimeSlots(this.selectedField.id, selectedDate);
        } else {
            this.availableTimeframes = [];
            this.bookingForm.get('timeSlot')?.setValue(''); 
        }
    });
  }
  
  fetchFieldDetails(fieldId: string): void {
    // Logic lấy chi tiết sân giữ nguyên
    this.bookingService.getFields().subscribe({
        next: (response: ApiResponse<Field[]>) => {
            if (response.status === 200) {
                this.selectedField = response.returnObject.find(f => f.id === fieldId) || null;
                if (!this.selectedField) {
                    this.router.navigate(['/']); 
                }
            }
        },
        error: (err: HttpErrorResponse) => {
            console.error('Failed to load field details:', err);
            this.router.navigate(['/']); 
        }
    });
  }

  populateUserDataFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    
    if (userJson) {
      try {
        const user: LocalUser = JSON.parse(userJson);
        
        // Điền vào form, các trường này ẩn trong HTML
        this.bookingForm.patchValue({
          playerName: user.name || 'Guest Player', 
          phoneNumber: user.phone || 'N/A'
        });

        console.log('User data loaded from localStorage and applied to hidden fields.');
        
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    } else {
      console.warn('No user data found in localStorage.');
    }
  }
  fetchTimeSlots(fieldId: string, dateApiFormat: string): void {
    this.bookingService.getTimeframesWithAvailability(fieldId, dateApiFormat).subscribe({
        next: (response: ApiResponse<TimeframeAvailability[]>) => {
            if (response.status === 200) {
                // ⚠️ CẬP NHẬT: Lọc các slot có status = 0 (trống)
                this.availableTimeframes = response.returnObject.filter(slot => slot.status === 0);
                
                if (this.availableTimeframes.length === 0) {
                    console.log('No available slots for this date.');
                }
                this.bookingForm.get('timeSlot')?.setValue('');
            } else {
                this.availableTimeframes = [];
            }
        },
        error: (err: HttpErrorResponse) => {
            console.error('Failed to load time slots:', err);
            this.availableTimeframes = [];
        }
    });
  }

  onSubmit() {
    // Chỉ cần kiểm tra Date và TimeSlot vì các trường User đã được tự điền
    if (!this.bookingForm.valid || !this.selectedField) {
      this.markFormGroupTouched();
      // Hiển thị alert nếu Date hoặc TimeSlot chưa được chọn
      if (!this.bookingForm.get('date')?.value || !this.bookingForm.get('timeSlot')?.value) {
           alert('Vui lòng chọn Ngày và Khung giờ để đặt sân.');
      }
      return;
    }
    
    const timeSlotId = this.bookingForm.get('timeSlot')?.value;
    const selectedDate = this.bookingForm.get('date')?.value; // Ngày chọn
    
    console.log('Sending final booking request with Time Slot ID:', timeSlotId, 'and Date:', selectedDate);
    
    // 1. GỌI API BOOKING (POST /api/Booking?date=...)
    // Sử dụng service mới: createBooking(timeSlotId, selectedDate)
    this.bookingService.createBooking(timeSlotId, selectedDate).subscribe({
      next: (response: ApiResponse<string>) => {
        // Giả định response.returnObject là ID Booking mới tạo (string)
        const newBookingId = response.returnObject;

        if (response.status === 200 && newBookingId) {
          console.log(`Booking successful. New Booking ID: ${newBookingId}`);
          
          // 2. GỌI API THANH TOÁN QR
          this.getQRAndRedirect(newBookingId);
          
        } else {
          // Xử lý thông báo lỗi (như ảnh)
          alert(`Đặt sân thất bại: ${response.message || 'Lỗi không xác định.'}`);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Booking submission failed:', err);
        // Kiểm tra lỗi để đưa ra thông báo chính xác hơn
        if (err.status === 409) {
             alert('Khung giờ đã chọn vừa bị đặt. Vui lòng chọn khung giờ khác.');
        } else {
             alert('Có lỗi hệ thống khi đặt sân. Vui lòng thử lại.');
        }
      }
    });
  }

  getQRAndRedirect(bookingId: string): void {
  this.bookingService.getPaymentQR(bookingId).subscribe({
  next: (response: ApiResponse<string>) => {
    const qrLink = response.returnObject; 

    if (response.status === 200 && qrLink) {
      window.location.href = qrLink;
      } else {
        alert('Đặt sân thành công nhưng không lấy được link QR.');
      }
    },
    error: (err: HttpErrorResponse) => {
      alert('Lỗi: Có vấn đề xảy ra khi gọi dịch vụ thanh toán QR. Vui lòng thử lại.');
    }
  });
}

  getTimeSlotLabel(timeframeId: string): string {
    const slot = this.availableTimeframes.find(slot => slot.id === timeframeId);
    if (slot) {
        return `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
    }
    return 'Chọn khung giờ';
  }

  // Các hàm phụ trợ giữ nguyên
  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      // Giả định rating, vì không có trong Field interface
      stars.push(i <= (rating || 4.8));
    }
    return stars;
  }

  private markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
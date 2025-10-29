import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // ⚠️ Cần import HttpParams
import { Observable } from 'rxjs';

// ==========================================================
// 1. CẤU TRÚC PHẢN HỒI CHUNG VÀ INTERFACES
// ==========================================================

// Cấu trúc phản hồi chung từ API
export interface ApiResponse<T> {
  status: number;
  returnObject: T;
  message?: string;
}

// 1. Cấu trúc Sân (Field)
export interface Field {
  id: string; 
  name: string;
  address: string; 
  price_per_hour: number;
  owner_id: string;
  status: number;
  isDelete: boolean;
  url: string;
  // Giả định thêm các trường cần thiết cho FE (Nếu có)
  // imageUrl?: string; 
  // rating?: number;
}

// 2. Cấu trúc Khung giờ CÓ TRẠNG THÁI KHẢ DỤNG (Timeframe Availability)
export interface TimeframeAvailability {
  id: string; // ID của Timeframe (GUID)
  startTime: string; 
  endTime: string; 
  status: number; // 0 = Available, 1 = Booked
  fieldId: string;
}

/**
 * ⚠️ CẬP NHẬT: Cấu trúc Request Body cho POST /api/Booking
 * BE yêu cầu chỉ gửi mảng ID khung giờ (Array<string>) trong Body
 */
export type TimeframePayload = string[];

// ==========================================================
// 2. BOOKING SERVICE
// ==========================================================

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://ketsan.mnhduc.site/api'; 

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả các sân (API GET /api/Field)
   */
  getFields(): Observable<ApiResponse<Field[]>> {
    return this.http.get<ApiResponse<Field[]>>(`${this.apiUrl}/Field`);
  }

  /**
   * Lấy khung giờ VÀ trạng thái khả dụng theo FieldId và Ngày cụ thể (API GET /api/TimeFrame)
   */
  getTimeframesWithAvailability(fieldId: string, dateApiFormat: string): Observable<ApiResponse<TimeframeAvailability[]>> {
    const url = `${this.apiUrl}/TimeFrame?FieldId=${fieldId}&Date=${dateApiFormat}`;
    return this.http.get<ApiResponse<TimeframeAvailability[]>>(url);
  }
  
  /**
   * ⚠️ CẬP NHẬT PHƯƠNG THỨC: POST /api/Booking
   * Payload: Array<string> (Timeframe IDs) trong body. 
   * Date: Query Parameter.
   * BE trả về một ID booking (string) sau khi đặt thành công.
   */
  createBooking(timeSlotId: string, selectedDate: string): Observable<ApiResponse<string>> {
    // Request Body: Mảng chứa 1 ID khung giờ
    const body: TimeframePayload = [timeSlotId]; 

    // Query Params: Chứa ngày
    const params = new HttpParams().set('date', selectedDate);
    
    // Giả định BE trả về ApiResponse<string> (string là ID Booking)
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/Booking`, body, { params });
  }

  /**
   * PHƯƠNG THỨC MỚI: POST /api/Payment/GetPaymentQR
   * Lấy mã QR thanh toán bằng ID Booking
   * @param bookingId ID Booking trả về từ createBooking
   * @returns Observable<ApiResponse<any>> (chứa URL QR/template URL)
   */
  getPaymentQR(bookingId: string): Observable<ApiResponse<string>> { 
    const params = new HttpParams().set('id', bookingId);
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/Payment/GetPaymentQR`, { params });
  }
}
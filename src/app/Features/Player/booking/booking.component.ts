import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export interface FootballField {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  openHours: string;
  imageUrl: string;
  rating: number;
  features: string[];
  description: string;
}

export interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
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
  selectedField: FootballField | null = null;
  currentUser$ = this.authService.currentUser$;
  
  timeSlots: TimeSlot[] = [
    { value: '06:00', label: '6:00 AM - 7:00 AM', available: true },
    { value: '07:00', label: '7:00 AM - 8:00 AM', available: true },
    { value: '08:00', label: '8:00 AM - 9:00 AM', available: false },
    { value: '09:00', label: '9:00 AM - 10:00 AM', available: true },
    { value: '10:00', label: '10:00 AM - 11:00 AM', available: true },
    { value: '11:00', label: '11:00 AM - 12:00 PM', available: true },
    { value: '12:00', label: '12:00 PM - 1:00 PM', available: false },
    { value: '13:00', label: '1:00 PM - 2:00 PM', available: true },
    { value: '14:00', label: '2:00 PM - 3:00 PM', available: true },
    { value: '15:00', label: '3:00 PM - 4:00 PM', available: true },
    { value: '16:00', label: '4:00 PM - 5:00 PM', available: false },
    { value: '17:00', label: '5:00 PM - 6:00 PM', available: true },
    { value: '18:00', label: '6:00 PM - 7:00 PM', available: true },
    { value: '19:00', label: '7:00 PM - 8:00 PM', available: true },
    { value: '20:00', label: '8:00 PM - 9:00 PM', available: true },
    { value: '21:00', label: '9:00 PM - 10:00 PM', available: true }
  ];

  // Demo field data
  demoField: FootballField = {
    id: 1,
      name: 'Sân bóng 1',
      location: 'Hà Nội',
      pricePerHour: 145000,
      openHours: '6:00 AM - 11:00 PM',
      imageUrl: 'https://thamconhantao.vn/wp-content/uploads/2019/01/du-an-san-bong-co-nhan-tao-thach-ban-long-bien-2.jpg',
      rating: 4.8,
    features: ['Floodlights', 'Changing Rooms', 'Parking', 'Equipment Rental', 'Refreshments'],
    description: 'Sân bóng rất đẹp',
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      playerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{10,}$/)]],
      specialRequests: ['']
    });
  }

  ngOnInit() {
    // Get field ID from query params
    this.route.queryParams.subscribe(params => {
      const fieldId = params['fieldId'];
      if (fieldId) {
        // In a real app, you would fetch field data by ID from a service
        this.selectedField = this.demoField;
      } else {
        this.selectedField = this.demoField;
      }
    });
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
  }

  onSubmit() {
    if (this.bookingForm.valid && this.selectedField) {
      const bookingData = {
        field: this.selectedField,
        ...this.bookingForm.value,
        totalPrice: this.selectedField.pricePerHour
      };
      
      console.log('Booking submitted:', bookingData);
      
      // Show success message (in a real app, you'd call a booking service)
      alert(`Booking confirmed for ${this.selectedField.name} on ${bookingData.date} at ${this.getTimeSlotLabel(bookingData.timeSlot)}!`);
      
      // Reset form
      this.bookingForm.reset();
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  getTimeSlotLabel(value: string): string {
    const slot = this.timeSlots.find(slot => slot.value === value);
    return slot ? slot.label : value;
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
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
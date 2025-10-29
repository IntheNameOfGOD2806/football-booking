import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FieldService } from '../auth/field.service'; 

export interface FootballField {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  openHours: string;
  url: string;
  rating: number;
  features: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { // ✅ Thêm OnInit
  currentUser$ = this.authService.currentUser$;
  footballFields: FootballField[] = []; // ✅ Ban đầu rỗng

  constructor(
    private router: Router,
    private authService: AuthService,
    private fieldService: FieldService // ✅ Thêm service này
  ) {}

  ngOnInit() {
    this.loadFields();
  }

  // ✅ Hàm mới để gọi API thật
  loadFields() {
    this.fieldService.getFields().subscribe({
      next: (res) => {
        console.log('Field API data:', res);

        // Nếu backend trả về mảng JSON đơn giản:
        //this.footballFields = res;

        // Nếu backend trả object có "returnObject":
        this.footballFields = res.returnObject;

        // Nếu dữ liệu chưa chuẩn, có thể map lại cho khớp UI:
        // this.footballFields = res.returnObject.map((f: any) => ({
        //   id: f.id,
        //   name: f.name,
        //   location: f.location || 'Chưa rõ',
        //   pricePerHour: f.pricePerHour || 0,
        //   openHours: f.openHours || '',
        //   imageUrl: f.imageUrl || 'default.jpg',
        //   rating: f.rating || 4.5,
        //   features: f.features ? f.features.split(',') : []
        // }));
      },
      error: (err) => {
        console.error('Error loading fields:', err);
      }
    });
  }

  onBookNow(field: FootballField) {
    this.router.navigate(['/booking'], { queryParams: { fieldId: field.id } });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }
}

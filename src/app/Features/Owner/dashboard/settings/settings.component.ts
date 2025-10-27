import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  businessForm: FormGroup;
  notificationForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['John Doe', Validators.required],
      email: ['john@example.com', [Validators.required, Validators.email]],
      phone: ['+1234567890', Validators.required],
      bio: ['Field owner passionate about sports']
    });

    this.businessForm = this.fb.group({
      businessName: ['Sports Arena Management', Validators.required],
      businessAddress: ['123 Sports Ave, City', Validators.required],
      businessPhone: ['+1234567890', Validators.required],
      taxId: ['123-45-6789']
    });

    this.notificationForm = this.fb.group({
      emailBookings: [true],
      emailUpdates: [true],
      emailMarketing: [false],
      smsBookings: [true],
      smsReminders: [true]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {}

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Profile saved:', this.profileForm.value);
    }
  }

  saveBusiness() {
    if (this.businessForm.valid) {
      console.log('Business info saved:', this.businessForm.value);
    }
  }

  saveNotifications() {
    console.log('Notifications saved:', this.notificationForm.value);
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const { newPassword, confirmPassword } = this.passwordForm.value;
      if (newPassword === confirmPassword) {
        console.log('Password changed successfully');
        this.passwordForm.reset();
      }
    }
  }
}

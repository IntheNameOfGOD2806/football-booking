import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
  if (this.loginForm.invalid) { this.markFormGroupTouched(); return; }
  this.isLoading = true; this.errorMessage = '';
  const { email, password } = this.loginForm.value as { email: string; password: string };

  this.authService.login(email, password).subscribe({
    next: (ok) => {
      this.isLoading = false;
      if (!ok) { this.errorMessage = 'Invalid email or password'; return; }

      const role = this.authService.getRole(); // 'owner' | 'player'
      this.router.navigateByUrl(role === 'owner' ? '/owner/dashboard' : '/home'); // đi thẳng trang con
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = 'Login failed. Please try again.';
      console.error(err);
    }
  });
}



  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  forgotPassword() {
    console.log('Forgot password clicked');
    // Add your forgot password logic here
  }
}
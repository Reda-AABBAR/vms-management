import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Auth service - you'll need to create this
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RippleModule,
    ProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const { email, password } = this.form.value;
      await this.auth.login(email, password).toPromise();
      await this.router.navigateByUrl('/');
    } catch (err: any) {
      console.error('Login error', err);
      this.error.set(err?.error?.message || 'Login failed');
    } finally {
      this.isLoading.set(false);
    }
  }
}

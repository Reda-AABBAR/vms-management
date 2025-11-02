import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form!: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    // initialize form in the constructor to avoid using `this` before initialization
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.error = null;
    if (this.form.invalid) return;
    const { email, password } = this.form.value as { email: string; password: string };
    this.auth.login(email, password).subscribe({
      next: (res) => {
        // Optionnel : afficher le nom d'utilisateur ou stocker l'utilisateur si besoin
        // Exemple : this.user = res.user;
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.error('Login error', err);
        this.error = err?.error?.message || 'Login failed';
      },
    });
  }
}

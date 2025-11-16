import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <p-card header="Dashboard" styleClass="dashboard-card">
        <div class="user-info">
          <h2>Welcome, {{ currentUser?.username }} {{ currentUser?.lastname }}!</h2>
          <p><strong>Email:</strong> {{ currentUser?.email }}</p>
          <p><strong>User ID:</strong> {{ currentUser?.id }}</p>
          <p><strong>Member since:</strong> {{ currentUser?.created_at | date }}</p>
        </div>
        
        <div class="actions">
          <button 
            pButton 
            pRipple 
            label="Logout" 
            icon="pi pi-sign-out" 
            class="p-button-danger"
            (click)="logout()"
          ></button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .dashboard-card {
      max-width: 600px;
      margin: 0 auto;
    }
    .user-info {
      margin-bottom: 2rem;
    }
    .user-info h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    .actions {
      text-align: right;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Redirect to login if not authenticated
    if (!this.authService.isLoggedIn() || !this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

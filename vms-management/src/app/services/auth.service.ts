import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  lastname: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiHost;
  private readonly loginUrl = `${this.apiUrl}/auth/login`;
  private readonly registerUrl = `${this.apiUrl}/auth/register`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(this.loginUrl, credentials);
  }

  register(userData: RegisterRequest) {
    return this.http.post<RegisterResponse>(this.registerUrl, userData);
  }

  setAuthData(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      // Set token cookie with 1 day expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const name = 'authToken=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
    }
    return null;
  }

  getUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.getUser();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clear token cookie
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear user data
      localStorage.removeItem('user');
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}

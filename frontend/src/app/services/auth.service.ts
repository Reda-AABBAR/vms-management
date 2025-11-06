import { Injectable, Inject, PLATFORM_ID, Optional, REQUEST } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ssrToken: string | null = null;
  private user: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject(REQUEST) private request: any
  ) {
    this.loadSSRtoken();
  }

  /** ✅ SSR: read cookie sent by Go backend */
  private loadSSRtoken() {
    if (isPlatformServer(this.platformId) && this.request?.headers?.cookie) {
      const token = this.request.headers.cookie.match(/token=([^;]+)/);
      if (token) {
        this.ssrToken = token[1];
      }
    }
  }

  /** ✅ Universal method to check authentication */
  isAuthenticated(): boolean {
    return !!this.ssrToken || !!this.user;
  }

  /** ✅ Login (cookie stored by backend automatically) */
  login(email: string, password: string) {
    return this.http.post('/api/auth/login', { email, password }, {
      withCredentials: true
    });
  }

  /** ✅ Load current user (browser + SSR safe) */
  fetchUser() {
    return this.http.get('/api/auth/me', { withCredentials: true })
      .subscribe({
        next: (u) => this.user = u,
        error: () => this.user = null
      });
  }

  /** ✅ Logout: backend clears cookie */
  logout() {
    this.http.post('/api/auth/logout', {}, { withCredentials: true })
      .subscribe(() => {
        this.ssrToken = null;
        this.user = null;
        this.router.navigate(['/login']);
      });
  }

  /** ✅ Get user profile */
  getUser() {
    return this.user;
  }
}

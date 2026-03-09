import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'telefon_rehber_token';
const USER_KEY = 'telefon_rehber_user';

export interface AuthUser {
  userId: number;
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  displayName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = '/api/auth';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        userId: res.userId,
        email: res.email,
        displayName: res.displayName
      })
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password });
  }

  register(email: string, password: string, displayName?: string) {
    return this.http.post<AuthResponse>(`${this.api}/register`, {
      email,
      password,
      displayName: displayName || null
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  onLoginSuccess(res: AuthResponse): void {
    this.setSession(res);
  }
}

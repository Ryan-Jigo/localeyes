import { User } from './auth';
import { apiClient } from './api';

export interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthService {
  private storageKey = 'localeyes_auth';

  async login(email: string, password: string): Promise<AuthState> {
    try {
      const response = await apiClient.login(email, password);
      const authState: AuthState = {
        user: response.user,
        token: response.token
      };
      localStorage.setItem(this.storageKey, JSON.stringify(authState));
      return authState;
    } catch (error: any) {
      console.error('API login failed, falling back to localStorage:', error);
      // Fallback to localStorage for demo purposes
      return this.loginLocal(email, password);
    }
  }

  private loginLocal(email: string, password: string): AuthState {
    const normalizedEmail = email.toLowerCase();
    
    // Check hardcoded authority users
    const authorityUsers = {
      'pwd@kseb.localeyes.com': { password: 'authority123', user: { id: '1', email: 'pwd@kseb.localeyes.com', role: 'authority', department: 'PWD', name: 'PWD Authority' } },
      'water@kerala.localeyes.com': { password: 'authority123', user: { id: '2', email: 'water@kerala.localeyes.com', role: 'authority', department: 'Water', name: 'Water Authority' } },
      'kseb@kerala.localeyes.com': { password: 'authority123', user: { id: '3', email: 'kseb@kerala.localeyes.com', role: 'authority', department: 'KSEB', name: 'KSEB Authority' } },
      'waste@kerala.localeyes.com': { password: 'authority123', user: { id: '4', email: 'waste@kerala.localeyes.com', role: 'authority', department: 'Waste Management', name: 'Waste Management Authority' } },
      'other@kerala.localeyes.com': { password: 'authority123', user: { id: '5', email: 'other@kerala.localeyes.com', role: 'authority', department: 'Other', name: 'Other Department Authority' } },
    };

    let userData = authorityUsers[normalizedEmail];
    if (!userData) {
      // Check localStorage for registered users
      const stored = localStorage.getItem('localeyes_registered_users');
      if (stored) {
        const users = JSON.parse(stored);
        userData = users[normalizedEmail];
      }
    }

    if (!userData || userData.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = `mock_token_${Date.now()}`;
    const authState: AuthState = {
      user: userData.user,
      token
    };
    localStorage.setItem(this.storageKey, JSON.stringify(authState));
    return authState;
  }

  async register(email: string, password: string, name?: string): Promise<AuthState> {
    try {
      const response = await apiClient.register(email, password, name);
      const authState: AuthState = {
        user: response.user,
        token: response.token
      };
      localStorage.setItem(this.storageKey, JSON.stringify(authState));
      return authState;
    } catch (error: any) {
      console.error('API register failed, falling back to localStorage:', error);
      // Fallback to localStorage for demo purposes
      return this.registerLocal(email, password, name);
    }
  }

  private registerLocal(email: string, password: string, name?: string): AuthState {
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const stored = localStorage.getItem('localeyes_registered_users');
    const users = stored ? JSON.parse(stored) : {};
    
    if (users[normalizedEmail]) {
      throw new Error('An account with this email already exists');
    }
    
    const newUser: User = { id: `${Date.now()}`, email: normalizedEmail, role: 'user', name };
    users[normalizedEmail] = { password, user: newUser };
    localStorage.setItem('localeyes_registered_users', JSON.stringify(users));
    
    const token = `mock_token_${Date.now()}`;
    const authState: AuthState = {
      user: newUser,
      token
    };
    localStorage.setItem(this.storageKey, JSON.stringify(authState));
    return authState;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      const authState = JSON.parse(stored);
      return authState.user;
    } catch {
      return null;
    }
  }

  getCurrentToken(): string | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      const authState = JSON.parse(stored);
      return authState.token;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
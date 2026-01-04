export interface User {
  id: string;
  email: string;
  role: 'user' | 'authority';
  department?: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthService {
  private storageKey = 'localeyes_auth';

  // Mock users for demo - in real app this would be API calls
  private mockUsers: Record<string, { password: string; user: User }> = {
    'citizen@example.com': {
      password: 'password123',
      user: {
        id: '1',
        email: 'citizen@example.com',
        role: 'user',
        name: 'John Citizen'
      }
    },
    'pwd@kseb.localeyes.com': {
      password: 'authority123',
      user: {
        id: '2',
        email: 'pwd@kseb.localeyes.com',
        role: 'authority',
        department: 'PWD',
        name: 'PWD Authority'
      }
    },
    'water@kerala.localeyes.com': {
      password: 'authority123',
      user: {
        id: '3',
        email: 'water@kerala.localeyes.com',
        role: 'authority',
        department: 'Water',
        name: 'Water Authority'
      }
    },
    'kseb@kerala.localeyes.com': {
      password: 'authority123',
      user: {
        id: '4',
        email: 'kseb@kerala.localeyes.com',
        role: 'authority',
        department: 'KSEB',
        name: 'KSEB Authority'
      }
    },
    'waste@kerala.localeyes.com': {
      password: 'authority123',
      user: {
        id: '5',
        email: 'waste@kerala.localeyes.com',
        role: 'authority',
        department: 'Waste Management',
        name: 'Waste Management Authority'
      }
    }
  };

  login(email: string, password: string): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userData = this.mockUsers[email.toLowerCase()];
        
        if (!userData || userData.password !== password) {
          reject(new Error('Invalid credentials'));
          return;
        }

        const token = `mock_token_${Date.now()}`;
        const authState = {
          user: userData.user,
          token
        };

        localStorage.setItem(this.storageKey, JSON.stringify(authState));
        resolve(authState);
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  getStoredAuth(): AuthState | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isValidToken(token: string): boolean {
    return token?.startsWith('mock_token_') || false;
  }
}

export const authService = new AuthService();
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
  private userStorageKey = 'localeyes_registered_users';

  // Mock users for demo - in real app this would be API calls
  private mockUsers: Record<string, { password: string; user: User }> = {
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
    },
    'other@kerala.localeyes.com': {
      password: 'authority123',
      user: {
        id: '6',
        email: 'other@kerala.localeyes.com',
        role: 'authority',
        department: 'Other',
        name: 'Other Department Authority'
      }
    }
  };

  login(email: string, password: string): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase();

        // First, check registered users stored in localStorage
        const registeredUsers = this.getRegisteredUsers();
        let userData = registeredUsers[normalizedEmail];

        // If not found, fall back to mock authority accounts
        if (!userData) {
          userData = this.mockUsers[normalizedEmail];
        }
        
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

  private getRegisteredUsers(): Record<string, { password: string; user: User }> {
    try {
      const raw = localStorage.getItem(this.userStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveRegisteredUsers(users: Record<string, { password: string; user: User }>): void {
    localStorage.setItem(this.userStorageKey, JSON.stringify(users));
  }

  register(email: string, password: string, name?: string): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase();
        const users = this.getRegisteredUsers();

        if (users[normalizedEmail] || this.mockUsers[normalizedEmail]) {
          reject(new Error('An account with this email already exists'));
          return;
        }

        const newUser: User = {
          id: `${Date.now()}`,
          email: normalizedEmail,
          role: 'user',
          name
        };

        users[normalizedEmail] = { password, user: newUser };
        this.saveRegisteredUsers(users);

        const token = `mock_token_${Date.now()}`;
        const authState = { user: newUser, token };
        localStorage.setItem(this.storageKey, JSON.stringify(authState));
        resolve(authState);
      }, 800);
    });
  }
}

export const authService = new AuthService();
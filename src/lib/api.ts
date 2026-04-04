// API client for communicating with the backend
const API_BASE = '/api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'user' | 'authority';
    department?: string;
    name?: string;
  };
  token: string;
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    try {
      const stored = localStorage.getItem('localeyes_auth');
      if (!stored) return {};
      const authState = JSON.parse(stored);
      if (authState?.token) {
        return { Authorization: `Bearer ${authState.token}` };
      }
    } catch {
      // ignore
    }
    return {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Issues endpoints
  async getIssues(): Promise<unknown> {
    return this.request('/issues');
  }

  async getIssuesByDepartment(department: string): Promise<unknown> {
    return this.request(`/issues/department/${encodeURIComponent(department)}`);
  }

  async getIssuesByUser(userId: string): Promise<unknown> {
    return this.request(`/issues/user/${userId}`);
  }

  async createIssue(data: {
    title: string;
    description: string;
    department: string;
    location: { latitude: number; longitude: number; address?: string };
    images?: string[];
    reporterId: string;
    reporterEmail: string;
  }): Promise<unknown> {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async upvoteIssue(issueId: string, userId: string): Promise<unknown> {
    return this.request(`/issues/${issueId}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async downvoteIssue(issueId: string, userId: string): Promise<unknown> {
    return this.request(`/issues/${issueId}/downvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateIssueStatus(issueId: string, status: string): Promise<unknown> {
    return this.request(`/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getUserVotes(userId: string): Promise<unknown> {
    return this.request(`/issues/votes/${userId}`);
  }

  async voteCredibility(issueId: string, vote: 1 | -1): Promise<unknown> {
    return this.request(`/issues/${issueId}/credibility`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  async getCredibilityVotes(authorityId: string): Promise<unknown> {
    return this.request(`/issues/credibility-votes/${authorityId}`);
  }
}

export const apiClient = new ApiClient();

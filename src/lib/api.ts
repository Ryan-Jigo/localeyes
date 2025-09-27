// API client for communicating with the backend
const API_BASE = '/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      // Fallback to localStorage if API is not available
      throw new Error('API not available - please start the backend server');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Issues endpoints
  async getIssues() {
    return this.request('/issues');
  }

  async getIssuesByDepartment(department: string) {
    return this.request(`/issues/department/${encodeURIComponent(department)}`);
  }

  async getIssuesByUser(userId: string) {
    return this.request(`/issues/user/${userId}`);
  }

  async createIssue(data: {
    title: string;
    description: string;
    department: string;
    location: any;
    images?: any[];
    reporterId: string;
    reporterEmail: string;
  }) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async upvoteIssue(issueId: string, userId: string) {
    return this.request(`/issues/${issueId}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async downvoteIssue(issueId: string, userId: string) {
    return this.request(`/issues/${issueId}/downvote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateIssueStatus(issueId: string, status: string) {
    return this.request(`/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getUserVotes(userId: string) {
    return this.request(`/issues/votes/${userId}`);
  }
}

export const apiClient = new ApiClient();

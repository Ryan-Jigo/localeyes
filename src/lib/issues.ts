import { Issue, CreateIssueData } from '../types/issue';
import { apiClient } from './api';

class IssuesService {
  async getIssues(): Promise<Issue[]> {
    try {
      return await apiClient.getIssues();
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('localeyes_issues');
        const issues = stored ? JSON.parse(stored) : [];
        return issues.map((issue: any) => ({
          ...issue,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
          location: issue.location,
          images: issue.images || [],
          abuseReporters: issue.abuseReporters || []
        }));
      } catch {
        return [];
      }
    }
  }

  async getIssuesByDepartment(department: string): Promise<Issue[]> {
    try {
      return await apiClient.getIssuesByDepartment(department);
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      const allIssues = await this.getIssues();
      return allIssues.filter(issue => issue.department === department);
    }
  }

  async getIssuesByUser(userId: string): Promise<Issue[]> {
    try {
      return await apiClient.getIssuesByUser(userId);
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      const allIssues = await this.getIssues();
      return allIssues.filter(issue => issue.reporterId === userId);
    }
  }

  async createIssue(userId: string, userEmail: string, data: CreateIssueData): Promise<Issue> {
    try {
      return await apiClient.createIssue({
        title: data.title,
        description: data.description,
        department: data.department,
        location: data.location,
        images: data.images || [],
        reporterId: userId,
        reporterEmail: userEmail
      });
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage
      const now = new Date();
      const newIssue: Issue = {
        id: Date.now().toString(),
        ...data,
        status: 'Open',
        reports: 0,
        abuseReporters: [],
        upvotes: 0,
        downvotes: 0,
        reporterId: userId,
        reporterEmail: userEmail,
        createdAt: now,
        updatedAt: now
      };
      
      const issues = await this.getIssues();
      const updatedIssues = [newIssue, ...issues];
      localStorage.setItem('localeyes_issues', JSON.stringify(updatedIssues));
      return newIssue;
    }
  }

  async upvoteIssue(issueId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.upvoteIssue(issueId, userId);
      return true;
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage voting
      return this.voteLocal(issueId, userId, 'upvote');
    }
  }

  async downvoteIssue(issueId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.downvoteIssue(issueId, userId);
      return true;
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage voting
      return this.voteLocal(issueId, userId, 'downvote');
    }
  }

  private voteLocal(issueId: string, userId: string, voteType: 'upvote' | 'downvote'): boolean {
    try {
      const issues = JSON.parse(localStorage.getItem('localeyes_issues') || '[]');
      const issueIndex = issues.findIndex((issue: any) => issue.id === issueId);
      
      if (issueIndex === -1) return false;
      
      const userUpvotes = JSON.parse(localStorage.getItem(`localeyes_upvotes_${userId}`) || '[]');
      const userDownvotes = JSON.parse(localStorage.getItem(`localeyes_downvotes_${userId}`) || '[]');
      
      if (voteType === 'upvote') {
        if (userUpvotes.includes(issueId)) {
          // Remove upvote
          issues[issueIndex].upvotes = Math.max(0, issues[issueIndex].upvotes - 1);
          const newUpvotes = userUpvotes.filter((id: string) => id !== issueId);
          localStorage.setItem(`localeyes_upvotes_${userId}`, JSON.stringify(newUpvotes));
        } else {
          // Add upvote
          issues[issueIndex].upvotes += 1;
          userUpvotes.push(issueId);
          localStorage.setItem(`localeyes_upvotes_${userId}`, JSON.stringify(userUpvotes));
          
          // Remove downvote if exists
          if (userDownvotes.includes(issueId)) {
            issues[issueIndex].downvotes = Math.max(0, issues[issueIndex].downvotes - 1);
            const newDownvotes = userDownvotes.filter((id: string) => id !== issueId);
            localStorage.setItem(`localeyes_downvotes_${userId}`, JSON.stringify(newDownvotes));
          }
        }
      } else {
        if (userDownvotes.includes(issueId)) {
          // Remove downvote
          issues[issueIndex].downvotes = Math.max(0, issues[issueIndex].downvotes - 1);
          const newDownvotes = userDownvotes.filter((id: string) => id !== issueId);
          localStorage.setItem(`localeyes_downvotes_${userId}`, JSON.stringify(newDownvotes));
        } else {
          // Add downvote
          issues[issueIndex].downvotes += 1;
          userDownvotes.push(issueId);
          localStorage.setItem(`localeyes_downvotes_${userId}`, JSON.stringify(userDownvotes));
          
          // Remove upvote if exists
          if (userUpvotes.includes(issueId)) {
            issues[issueIndex].upvotes = Math.max(0, issues[issueIndex].upvotes - 1);
            const newUpvotes = userUpvotes.filter((id: string) => id !== issueId);
            localStorage.setItem(`localeyes_upvotes_${userId}`, JSON.stringify(newUpvotes));
          }
        }
      }
      
      localStorage.setItem('localeyes_issues', JSON.stringify(issues));
      return true;
    } catch {
      return false;
    }
  }

  async updateIssueStatus(issueId: string, status: Issue['status']): Promise<boolean> {
    try {
      await apiClient.updateIssueStatus(issueId, status);
      return true;
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        const issues = JSON.parse(localStorage.getItem('localeyes_issues') || '[]');
        const issueIndex = issues.findIndex((issue: any) => issue.id === issueId);
        if (issueIndex === -1) return false;
        
        issues[issueIndex].status = status;
        issues[issueIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('localeyes_issues', JSON.stringify(issues));
        return true;
      } catch {
        return false;
      }
    }
  }

  async getUserUpvotes(userId: string): Promise<Set<string>> {
    try {
      const response = await apiClient.getUserVotes(userId);
      return new Set(response.upvotes);
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`localeyes_upvotes_${userId}`);
        return stored ? new Set(JSON.parse(stored)) : new Set();
      } catch {
        return new Set();
      }
    }
  }

  async getUserDownvotes(userId: string): Promise<Set<string>> {
    try {
      const response = await apiClient.getUserVotes(userId);
      return new Set(response.downvotes);
    } catch (error) {
      console.error('API failed, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`localeyes_downvotes_${userId}`);
        return stored ? new Set(JSON.parse(stored)) : new Set();
      } catch {
        return new Set();
      }
    }
  }

  async getUserCredibility(userId: string): Promise<number> {
    try {
      const userIssues = await this.getIssuesByUser(userId);
      return userIssues.reduce((sum, issue) => sum + (issue.upvotes || 0) - (issue.downvotes || 0), 0);
    } catch (error) {
      console.error('Error calculating user credibility:', error);
      return 0;
    }
  }

  async reportIssueAbuse(issueId: string, reporterUserId: string, threshold = 3): Promise<'reported' | 'already' | 'deleted' | 'not_found'> {
    // This would need to be implemented in the backend
    console.warn('Report abuse functionality not yet implemented in API');
    return 'not_found';
  }
}

export const issuesService = new IssuesService();
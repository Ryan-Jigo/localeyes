import { Issue, CreateIssueData } from '../types/issue';

// Mock data for demonstration
const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street causing traffic disruption',
    description: 'Large pothole near the intersection of Main Street and Oak Avenue. Multiple vehicles have been damaged. Urgent repair needed.',
    department: 'PWD',
    status: 'Open',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Main Street, Thiruvananthapuram'
    },
    images: [],
    upvotes: 23,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    title: 'Street light not working - safety concern',
    description: 'The street light on Park Road has been non-functional for over a week. This is creating safety issues for pedestrians and vehicles during night time.',
    department: 'KSEB',
    status: 'In Progress',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Park Road, Thiruvananthapuram'
    },
    images: [],
    upvotes: 18,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-16T09:20:00Z')
  },
  {
    id: '3',
    title: 'Water supply disruption in residential area',
    description: 'No water supply for the past 3 days in Sector 12. Multiple households affected. Need immediate attention.',
    department: 'Water',
    status: 'Open',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Sector 12, Thiruvananthapuram'
    },
    images: [],
    upvotes: 31,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-13T08:15:00Z'),
    updatedAt: new Date('2024-01-13T08:15:00Z')
  }
];

class IssuesService {
  private storageKey = 'localeyes_issues';
  private upvotesKey = 'localeyes_upvotes';
  private downvotesKey = 'localeyes_downvotes';

  getIssues(): Issue[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const issues = stored ? JSON.parse(stored) : MOCK_ISSUES;
      
      // Convert date strings back to Date objects
      return issues.map((issue: any) => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        downvotes: typeof issue.downvotes === 'number' ? issue.downvotes : 0
      }));
    } catch {
      return MOCK_ISSUES;
    }
  }

  getUserCredibility(userId: string): number {
    const userIssues = this.getIssues().filter(i => i.reporterId === userId);
    return userIssues.reduce((sum, i) => sum + (i.upvotes || 0) - (i.downvotes || 0), 0);
  }

  getIssuesByDepartment(department: string): Issue[] {
    return this.getIssues()
      .filter(issue => issue.department === department && issue.status !== 'Resolved')
      .sort((a, b) => b.upvotes - a.upvotes);
  }

  getIssuesByUser(userId: string): Issue[] {
    return this.getIssues()
      .filter(issue => issue.reporterId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getUserUpvotes(userId: string): Set<string> {
    try {
      const stored = localStorage.getItem(`${this.upvotesKey}_${userId}`);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  }

  getUserDownvotes(userId: string): Set<string> {
    try {
      const stored = localStorage.getItem(`${this.downvotesKey}_${userId}`);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  }

  createIssue(userId: string, userEmail: string, data: CreateIssueData): Issue {
    const issues = this.getIssues();
    
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    issues.unshift(newIssue);
    this.saveIssues(issues);
    
    return newIssue;
  }

  upvoteIssue(issueId: string, userId: string): boolean {
    const issues = this.getIssues();
    const userUpvotes = this.getUserUpvotes(userId);
    const userDownvotes = this.getUserDownvotes(userId);
    
    if (userUpvotes.has(issueId)) {
      // Toggle off (unvote)
      const issueIndex = issues.findIndex(issue => issue.id === issueId);
      if (issueIndex === -1) return false;
      issues[issueIndex].upvotes = Math.max(0, issues[issueIndex].upvotes - 1);
      userUpvotes.delete(issueId);
      this.saveIssues(issues);
      this.saveUserUpvotes(userId, userUpvotes);
      return true;
    }

    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      return false;
    }

    // If previously downvoted, remove the downvote first
    if (userDownvotes.has(issueId)) {
      issues[issueIndex].downvotes = Math.max(0, issues[issueIndex].downvotes - 1);
      userDownvotes.delete(issueId);
      this.saveUserDownvotes(userId, userDownvotes);
    }
    issues[issueIndex].upvotes += 1;
    userUpvotes.add(issueId);

    this.saveIssues(issues);
    this.saveUserUpvotes(userId, userUpvotes);
    
    return true;
  }

  downvoteIssue(issueId: string, userId: string): boolean {
    const issues = this.getIssues();
    const userDownvotes = this.getUserDownvotes(userId);
    const userUpvotes = this.getUserUpvotes(userId);
    
    if (userDownvotes.has(issueId)) {
      // Toggle off (remove downvote)
      const issueIndex = issues.findIndex(issue => issue.id === issueId);
      if (issueIndex === -1) return false;
      issues[issueIndex].downvotes = Math.max(0, issues[issueIndex].downvotes - 1);
      userDownvotes.delete(issueId);
      this.saveIssues(issues);
      this.saveUserDownvotes(userId, userDownvotes);
      return true;
    }
    
    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      return false;
    }
    
    // Remove upvote if present (downvote cancels out upvote)
    if (userUpvotes.has(issueId)) {
      issues[issueIndex].upvotes = Math.max(0, issues[issueIndex].upvotes - 1);
      userUpvotes.delete(issueId);
      this.saveUserUpvotes(userId, userUpvotes);
    }
    
    // Add downvote (this decreases the net score by 1)
    issues[issueIndex].downvotes += 1;
    userDownvotes.add(issueId);
    this.saveIssues(issues);
    this.saveUserDownvotes(userId, userDownvotes);
    return true;
  }

  reportIssueAbuse(issueId: string, reporterUserId: string, threshold = 3): 'reported' | 'already' | 'deleted' | 'not_found' {
    const issues = this.getIssues();
    const idx = issues.findIndex(i => i.id === issueId);
    if (idx === -1) return 'not_found';
    const issue = issues[idx];
    const reporters = new Set(issue.abuseReporters || []);
    if (reporters.has(reporterUserId)) return 'already';
    reporters.add(reporterUserId);
    issue.abuseReporters = Array.from(reporters);
    issue.reports = (issue.reports || 0) + 1;
    if (issue.reports >= threshold) {
      // Delete issue automatically
      issues.splice(idx, 1);
      this.saveIssues(issues);
      return 'deleted';
    }
    issues[idx] = { ...issue, updatedAt: new Date() };
    this.saveIssues(issues);
    return 'reported';
  }

  updateIssueStatus(issueId: string, status: Issue['status']): boolean {
    const issues = this.getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    
    if (issueIndex === -1) {
      return false;
    }

    issues[issueIndex].status = status;
    issues[issueIndex].updatedAt = new Date();
    
    this.saveIssues(issues);
    return true;
  }

  private saveIssues(issues: Issue[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(issues));
  }

  private saveUserUpvotes(userId: string, upvotes: Set<string>): void {
    localStorage.setItem(`${this.upvotesKey}_${userId}`, JSON.stringify([...upvotes]));
  }

  private saveUserDownvotes(userId: string, downvotes: Set<string>): void {
    localStorage.setItem(`${this.downvotesKey}_${userId}`, JSON.stringify([...downvotes]));
  }
}

export const issuesService = new IssuesService();
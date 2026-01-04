export interface Issue {
  id: string;
  title: string;
  description: string;
  department: 'PWD' | 'KSEB' | 'Water' | 'Waste Management' | 'Traffic' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  upvotes: number;
  downvotes: number;
  reporterId: string;
  reporterEmail: string;
  createdAt: Date;
  updatedAt: Date;
  hasUserUpvoted?: boolean;
  hasUserDownvoted?: boolean;
}

export interface CreateIssueData {
  title: string;
  description: string;
  department: Issue['department'];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
}

export const DEPARTMENTS: Issue['department'][] = [
  'PWD',
  'KSEB', 
  'Water',
  'Waste Management',
  'Traffic',
  'Other'
];

export const STATUS_COLORS = {
  Open: 'text-accent bg-accent-light',
  'In Progress': 'text-warning bg-warning/10',
  Resolved: 'text-success bg-success/10'
} as const;
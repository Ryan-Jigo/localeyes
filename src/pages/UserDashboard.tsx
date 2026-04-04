import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { issuesService } from '../lib/issues';
import { Issue, CreateIssueData, DEPARTMENTS } from '../types/issue';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  MapPin, ThumbsUp, ThumbsDown, AlertTriangle, Clock,
  CheckCircle, XCircle, Plus, LogOut, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [userDownvotes, setUserDownvotes] = useState<Set<string>>(new Set());
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [reportForm, setReportForm] = useState<{
    title: string;
    description: string;
    department: string;
    address: string;
  }>({
    title: '',
    description: '',
    department: '',
    address: '',
  });

  const loadIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allIssues, myUserIssues, upvotes, downvotes] = await Promise.all([
        issuesService.getIssues(),
        user ? issuesService.getIssuesByUser(user.id) : Promise.resolve([]),
        user ? issuesService.getUserUpvotes(user.id) : Promise.resolve(new Set<string>()),
        user ? issuesService.getUserDownvotes(user.id) : Promise.resolve(new Set<string>()),
      ]);
      setIssues(allIssues);
      setMyIssues(myUserIssues);
      setUserUpvotes(upvotes);
      setUserDownvotes(downvotes);
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // ✅ Optimistic vote update — no full data reload
  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    if (!user || votingId) return;

    setVotingId(issueId);
    const wasUpvoted = userUpvotes.has(issueId);
    const wasDownvoted = userDownvotes.has(issueId);

    // Optimistic update
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      if (voteType === 'upvote') {
        return {
          ...issue,
          upvotes: wasUpvoted ? issue.upvotes - 1 : issue.upvotes + 1,
          downvotes: wasDownvoted ? issue.downvotes - 1 : issue.downvotes,
        };
      } else {
        return {
          ...issue,
          downvotes: wasDownvoted ? issue.downvotes - 1 : issue.downvotes + 1,
          upvotes: wasUpvoted ? issue.upvotes - 1 : issue.upvotes,
        };
      }
    }));

    setUserUpvotes(prev => {
      const next = new Set(prev);
      if (voteType === 'upvote') {
        wasUpvoted ? next.delete(issueId) : next.add(issueId);
      } else {
        next.delete(issueId);
      }
      return next;
    });

    setUserDownvotes(prev => {
      const next = new Set(prev);
      if (voteType === 'downvote') {
        wasDownvoted ? next.delete(issueId) : next.add(issueId);
      } else {
        next.delete(issueId);
      }
      return next;
    });

    try {
      const success = voteType === 'upvote'
        ? await issuesService.upvoteIssue(issueId, user.id)
        : await issuesService.downvoteIssue(issueId, user.id);

      if (!success) {
        // Revert on failure
        await loadIssues();
        toast.error('Failed to vote on issue');
      }
    } catch (error) {
      await loadIssues(); // Revert
      toast.error('Failed to vote on issue');
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !reportForm.title || !reportForm.description || !reportForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let location: CreateIssueData['location'];

      // Try GPS first, fall back to manual address
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: reportForm.address || undefined,
        };
      } catch {
        // ✅ Geolocation denied/unavailable — use address as fallback
        if (!reportForm.address.trim()) {
          toast.error('Location access denied. Please enter your address manually.');
          setIsSubmitting(false);
          return;
        }
        // Use rough approximation or just store the address with placeholder coords
        location = {
          latitude: 0,
          longitude: 0,
          address: reportForm.address.trim(),
        };
      }

      const newIssue: CreateIssueData = {
        title: reportForm.title,
        description: reportForm.description,
        department: reportForm.department as CreateIssueData['department'],
        location,
        images: [],
      };

      await issuesService.createIssue(user.id, user.email, newIssue);
      toast.success('Issue reported successfully!');
      setShowReportForm(false);
      setReportForm({ title: '', description: '', department: '', address: '' });
      await loadIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Progress': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Client-side search/filter
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchQuery ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'all' || issue.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // ✅ Credibility: based on user's OWN issues' authority credibility votes
  const credibilityScore = myIssues.reduce(
    (sum, issue) => sum + (issue.credibility || 0),
    0
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Please log in to access the user dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary">LꙪCAL EYES</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    id="report-issue-btn"
                    onClick={() => setShowReportForm(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button
                    id="logout-btn"
                    variant="outline"
                    onClick={logout}
                    className="text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* All Issues */}
              <div className="lg:col-span-2 space-y-4">
                {/* ✅ Search & Filter bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search-issues"
                          placeholder="Search issues..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                        <SelectTrigger id="filter-dept" className="w-full sm:w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {DEPARTMENTS.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger id="filter-status" className="w-full sm:w-36">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Community Issues</CardTitle>
                    <CardDescription>
                      {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredIssues.length > 0 ? (
                      <div className="space-y-4">
                        {filteredIssues.map((issue) => (
                          <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{issue.title}</h3>
                              <Badge className={getStatusColor(issue.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(issue.status)}
                                  {issue.status}
                                </div>
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3">{issue.description}</p>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {issue.department}
                                </span>
                                <span>By {issue.reporterEmail}</span>
                              </div>
                              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                id={`upvote-${issue.id}`}
                                variant="outline"
                                size="sm"
                                disabled={votingId === issue.id}
                                onClick={() => handleVote(issue.id, 'upvote')}
                                className={`transition-transform hover:scale-110 active:scale-95 ${userUpvotes.has(issue.id) ? 'bg-primary text-white border-primary hover:bg-primary hover:text-white' : 'hover:bg-transparent hover:text-current'}`}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {issue.upvotes}
                              </Button>
                              <Button
                                id={`downvote-${issue.id}`}
                                variant="outline"
                                size="sm"
                                disabled={votingId === issue.id}
                                onClick={() => handleVote(issue.id, 'downvote')}
                                className={`transition-transform hover:scale-110 active:scale-95 ${userDownvotes.has(issue.id) ? 'bg-destructive text-white border-destructive hover:bg-destructive hover:text-white' : 'hover:bg-transparent hover:text-current'}`}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                {issue.downvotes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        {searchQuery || filterDepartment !== 'all' || filterStatus !== 'all'
                          ? 'No issues match your filters.'
                          : 'No issues reported yet.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* My Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Issues</CardTitle>
                    <CardDescription>Issues you've reported</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myIssues.length > 0 ? (
                      <div className="space-y-3">
                        {myIssues.map((issue) => (
                          <div key={issue.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{issue.title}</h4>
                              <Badge className={getStatusColor(issue.status)}>
                                {getStatusIcon(issue.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{issue.department}</span>
                              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">You haven't reported any issues yet.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Issues Reported</span>
                      <Badge variant="outline">{myIssues.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Issues Upvoted</span>
                      <Badge variant="outline">{userUpvotes.size}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Credibility Score</span>
                      {/* ✅ Fixed: uses myIssues, not all issues */}
                      <Badge variant="secondary">{credibilityScore}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>

          {/* Report Issue Dialog */}
          <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report a New Issue</DialogTitle>
                <DialogDescription>
                  Help improve your community by reporting issues that need attention.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label htmlFor="issue-title" className="text-sm font-medium">Issue Title *</label>
                  <Input
                    id="issue-title"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="mt-1"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="issue-dept" className="text-sm font-medium">Department *</label>
                  <Select
                    value={reportForm.department}
                    onValueChange={(value) => setReportForm({ ...reportForm, department: value })}
                  >
                    <SelectTrigger id="issue-dept" className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="issue-description" className="text-sm font-medium">Description *</label>
                  <Textarea
                    id="issue-description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Detailed description of the issue"
                    className="mt-1 min-h-[100px]"
                    maxLength={2000}
                  />
                </div>

                {/* ✅ Manual address fallback */}
                <div>
                  <label htmlFor="issue-address" className="text-sm font-medium">
                    Address / Location <span className="text-muted-foreground text-xs">(optional — used if GPS is denied)</span>
                  </label>
                  <Input
                    id="issue-address"
                    value={reportForm.address}
                    onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                    placeholder="e.g. Near Main Street junction, Thiruvananthapuram"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReportForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  id="submit-report-btn"
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
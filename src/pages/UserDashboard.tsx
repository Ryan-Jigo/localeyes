import React, { useState, useEffect } from 'react';
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
import { MapPin, ThumbsUp, ThumbsDown, AlertTriangle, Clock, CheckCircle, XCircle, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportForm, setReportForm] = useState<Omit<CreateIssueData, 'location'>>({
    title: '',
    description: '',
    department: '',
  });

  const loadIssues = async () => {
    try {
      setIsLoading(true);
      const [allIssues, myUserIssues, upvotes] = await Promise.all([
        issuesService.getIssues(),
        user ? issuesService.getIssuesByUser(user.id) : Promise.resolve([]),
        user ? issuesService.getUserUpvotes(user.id) : Promise.resolve(new Set()),
      ]);
      setIssues(allIssues);
      setMyIssues(myUserIssues);
      setUserUpvotes(upvotes);
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;

    try {
      const success = voteType === 'upvote' 
        ? await issuesService.upvoteIssue(issueId, user.id)
        : await issuesService.downvoteIssue(issueId, user.id);

      if (success) {
        await loadIssues(); // Reload to get updated vote counts
        toast.success(`Issue ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} successfully`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote on issue');
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !reportForm.title || !reportForm.description || !reportForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const newIssue: CreateIssueData = {
        ...reportForm,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };

      await issuesService.createIssue(user.id, user.email, newIssue);
      toast.success('Issue reported successfully!');
      setShowReportForm(false);
      setReportForm({ title: '', description: '', department: '' });
      await loadIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Progress':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

      {/* Dashboard Content */}
      {!isLoading && (
        <>
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary">LOCALEYES</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowReportForm(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground"
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
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Issues</CardTitle>
                    <CardDescription>
                      Issues reported by community members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {issues.length > 0 ? (
                      <div className="space-y-4">
                        {issues.map((issue) => (
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
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(issue.id, 'upvote')}
                                className={userUpvotes.has(issue.id) ? 'bg-green-50 border-green-200' : ''}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {issue.upvotes}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(issue.id, 'downvote')}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                {issue.downvotes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No issues reported yet.</p>
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
                      <Badge variant="secondary">
                        {issues.reduce((sum, issue) => sum + (issue.upvotes || 0) - (issue.downvotes || 0), 0)}
                      </Badge>
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
                  <label className="text-sm font-medium">Issue Title *</label>
                  <Input
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Department *</label>
                  <Select
                    value={reportForm.department}
                    onValueChange={(value) => setReportForm({ ...reportForm, department: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Detailed description of the issue, including location and any relevant details"
                    className="mt-1 min-h-[100px]"
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
                  onClick={handleSubmitReport} 
                  disabled={isSubmitting}
                  className="shadow-primary"
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
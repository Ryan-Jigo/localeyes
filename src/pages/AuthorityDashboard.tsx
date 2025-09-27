import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { issuesService } from '../lib/issues';
import { Issue } from '../types/issue';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { MapPin, Clock, User, LogOut, CheckCircle, PlayCircle, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!user || user.role !== 'authority') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is only accessible to authority users.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadIssues();
  }, [user]);

  const loadIssues = async () => {
    if (!user?.department) return;
    
    setIsLoading(true);
    try {
      const departmentIssues = await issuesService.getIssuesByDepartment(user.department);
      setIssues(departmentIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: Issue['status']) => {
    const success = await issuesService.updateIssueStatus(issueId, newStatus);
    if (success) {
      loadIssues();
      setShowStatusDialog(false);
      setSelectedIssue(null);
      toast({
        title: "Success",
        description: `Issue status updated to ${newStatus}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="h-4 w-4" />;
      case 'In Progress': return <PlayCircle className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusCounts = () => {
    return issues.reduce((counts, issue) => {
      counts[issue.status] = (counts[issue.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

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
                  <h1 className="text-2xl font-bold text-primary">LOCALEYES Authority</h1>
                  <p className="text-sm text-muted-foreground">
                    {user.department} Department Dashboard
                  </p>
                </div>
                <Button variant="outline" onClick={logout} className="shadow-primary">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                      <p className="text-2xl font-bold">{issues.length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open</p>
                      <p className="text-2xl font-bold text-blue-600">{statusCounts.Open || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{statusCounts['In Progress'] || 0}</p>
                    </div>
                    <PlayCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">{statusCounts.Resolved || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues List */}
            <Card>
              <CardHeader>
                <CardTitle>Issues for {user.department} Department</CardTitle>
                <CardDescription>
                  Manage and update the status of reported issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issues.length > 0 ? (
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{issue.title}</h3>
                                <Badge className={getStatusColor(issue.status)}>
                                  {getStatusIcon(issue.status)}
                                  <span className="ml-1">{issue.status}</span>
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-4">{issue.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span>{issue.location?.address || 'Unknown Location'}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>{issue.reporterEmail}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex items-center gap-4 text-sm">
                                  <span>Upvotes: {issue.upvotes || 0}</span>
                                  <span>Downvotes: {issue.downvotes || 0}</span>
                                  <span>Net Score: {(issue.upvotes || 0) - (issue.downvotes || 0)}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  {issue.status === 'Open' && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setShowStatusDialog(true);
                                      }}
                                      className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Start Work
                                    </Button>
                                  )}
                                  {issue.status === 'In Progress' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(issue.id, 'Resolved')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Resolved
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Open Issues</h3>
                      <p className="text-muted-foreground">
                        Great work! There are currently no open issues for the {user.department} department.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </main>

          {/* Status Update Dialog */}
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Issue Status</DialogTitle>
                <DialogDescription>
                  Change the status of "{selectedIssue?.title}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => selectedIssue && handleStatusUpdate(selectedIssue.id, 'In Progress')}
                    disabled={selectedIssue?.status === 'In Progress'}
                  >
                    <PlayCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">In Progress</div>
                      <div className="text-sm text-muted-foreground">Work has started on this issue</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => selectedIssue && handleStatusUpdate(selectedIssue.id, 'Resolved')}
                    disabled={selectedIssue?.status === 'Resolved'}
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Resolved</div>
                      <div className="text-sm text-muted-foreground">Issue has been fixed</div>
                    </div>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
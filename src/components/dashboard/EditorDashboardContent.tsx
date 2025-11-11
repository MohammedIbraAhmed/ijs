'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Stats {
  newSubmissions: number;
  underReview: number;
  awaitingDecision: number;
  totalManaged: number;
}

interface Manuscript {
  _id: string;
  title: string;
  status: string;
  manuscriptType: string;
  createdAt: string;
  updatedAt: string;
  submittedBy?: {
    name: string;
    email: string;
  };
}

export function EditorDashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, manuscriptsRes] = await Promise.all([
        fetch('/api/manuscripts/stats'),
        fetch('/api/manuscripts?limit=10&status=submitted,under_review,revision_required'),
      ]);

      const statsData = await statsRes.json();
      const manuscriptsData = await manuscriptsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (manuscriptsData.success) {
        setManuscripts(manuscriptsData.manuscripts);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-secondary-500',
      submitted: 'bg-accent-500',
      under_review: 'bg-warning-500',
      revision_required: 'bg-error-500',
      accepted: 'bg-success',
      rejected: 'bg-error-500',
      published: 'bg-primary-600',
    };
    return colors[status] || 'bg-secondary-500';
  };

  const getPriorityBadge = (status: string) => {
    if (status === 'submitted') return { text: 'New', color: 'bg-accent-500' };
    if (status === 'revision_required') return { text: 'Action Required', color: 'bg-error-500' };
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New Submissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary-600">
              {stats?.newSubmissions || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent-500">
              {stats?.underReview || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Awaiting Decision</CardDescription>
            <CardTitle className="text-3xl font-bold text-warning-500">
              {stats?.awaitingDecision || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Managed</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              {stats?.totalManaged || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Manuscripts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {manuscripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 text-muted-foreground"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                  />
                </svg>
                <p className="text-muted-foreground text-center">
                  No submissions requiring attention at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {manuscripts.map((manuscript) => {
                  const priority = getPriorityBadge(manuscript.status);
                  return (
                    <Link
                      key={manuscript._id}
                      href={`/manuscript/${manuscript._id}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                MS-{manuscript._id.substring(0, 8).toUpperCase()}
                              </Badge>
                              {priority && (
                                <Badge className={priority.color}>
                                  {priority.text}
                                </Badge>
                              )}
                              <Badge className={getStatusColor(manuscript.status)}>
                                {manuscript.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1 line-clamp-1">
                              {manuscript.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <span>By {manuscript.submittedBy?.name || 'Unknown'}</span>
                              <span>•</span>
                              <Badge variant="secondary" className="capitalize text-xs">
                                {manuscript.manuscriptType.replace('-', ' ')}
                              </Badge>
                              <span>•</span>
                              <span>
                                {format(new Date(manuscript.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            {manuscripts.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/editor/manuscripts">
                  <Button variant="outline" className="w-full">
                    View All Submissions →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Editorial management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/editor/manuscripts" className="block">
              <Button className="w-full justify-start" variant="outline">
                View All Submissions
              </Button>
            </Link>
            <Link href="/editor/assign-reviewers" className="block">
              <Button className="w-full justify-start" variant="outline">
                Assign Reviewers
              </Button>
            </Link>
            <Link href="/editor/decisions" className="block">
              <Button className="w-full justify-start" variant="outline">
                Review Decisions
              </Button>
            </Link>
            <Link href="/editor/profile" className="block">
              <Button className="w-full justify-start" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Review Status Overview */}
      {manuscripts.filter((m) => m.status === 'under_review').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manuscripts Under Review</CardTitle>
            <CardDescription>Track the progress of ongoing reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {manuscripts
                .filter((m) => m.status === 'under_review')
                .slice(0, 5)
                .map((manuscript) => (
                  <Link
                    key={manuscript._id}
                    href={`/manuscript/${manuscript._id}`}
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{manuscript.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {manuscript.submittedBy?.name}
                        </p>
                      </div>
                      <Badge variant="secondary">View Progress</Badge>
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

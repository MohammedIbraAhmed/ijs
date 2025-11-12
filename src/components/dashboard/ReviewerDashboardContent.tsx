'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Stats {
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
}

interface Manuscript {
  _id: string;
  title: string;
  status: string;
  manuscriptType: string;
  createdAt: string;
  updatedAt: string;
  reviewers?: Array<{
    user: string;
    status: string;
    invitedAt: string;
    deadline?: string;
  }>;
}

export function ReviewerDashboardContent() {
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
        fetch('/api/manuscripts?limit=10'),
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

  const getReviewStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      invited: 'bg-accent-500',
      accepted: 'bg-warning-500',
      declined: 'bg-secondary-500',
      completed: 'bg-success',
    };
    return colors[status] || 'bg-secondary-500';
  };

  const getManuscriptStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  const pendingManuscripts = manuscripts.filter((m) =>
    m.reviewers?.some((r) => ['invited', 'accepted'].includes(r.status))
  );
  const completedManuscripts = manuscripts.filter((m) =>
    m.reviewers?.some((r) => r.status === 'completed')
  );

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Reviews</CardDescription>
            <CardTitle className="text-3xl font-bold text-warning-500">
              {stats?.pendingReviews || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Reviews</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              {stats?.completedReviews || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary-600">
              {stats?.totalReviews || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Manuscripts awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingManuscripts.length === 0 ? (
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
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
                <p className="text-muted-foreground text-center">
                  No pending review invitations at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingManuscripts.map((manuscript) => {
                  const reviewerInfo = manuscript.reviewers?.find((r) =>
                    ['invited', 'accepted'].includes(r.status)
                  );
                  return (
                    <Link
                      key={manuscript._id}
                      href={`/reviewer/review/${manuscript._id}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                MS-{manuscript._id.substring(0, 8).toUpperCase()}
                              </Badge>
                              {reviewerInfo && (
                                <Badge
                                  className={getReviewStatusColor(reviewerInfo.status)}
                                >
                                  {reviewerInfo.status === 'invited'
                                    ? 'Invitation Pending'
                                    : 'In Progress'}
                                </Badge>
                              )}
                              <Badge
                                className={getManuscriptStatusColor(manuscript.status)}
                              >
                                {manuscript.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h4 className="font-medium mb-1 line-clamp-1">
                              {manuscript.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <Badge variant="secondary" className="capitalize text-xs">
                                {manuscript.manuscriptType.replace('-', ' ')}
                              </Badge>
                              <span>•</span>
                              <span>
                                Invited{' '}
                                {reviewerInfo?.invitedAt &&
                                  format(
                                    new Date(reviewerInfo.invitedAt),
                                    'MMM d, yyyy'
                                  )}
                              </span>
                              {reviewerInfo?.deadline && (
                                <>
                                  <span>•</span>
                                  <span className="text-warning-500">
                                    Due{' '}
                                    {format(new Date(reviewerInfo.deadline), 'MMM d, yyyy')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/reviewer/reviews" className="block">
              <Button className="w-full justify-start" variant="outline">
                View All Reviews
              </Button>
            </Link>
            <Link href="/reviewer/history" className="block">
              <Button className="w-full justify-start" variant="outline">
                Review History
              </Button>
            </Link>
            <Link href="/reviewer/profile" className="block">
              <Button className="w-full justify-start" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Completed Reviews */}
      {completedManuscripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed Reviews</CardTitle>
            <CardDescription>Your recent review contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedManuscripts.slice(0, 5).map((manuscript) => (
                <Link
                  key={manuscript._id}
                  href={`/reviewer/review/${manuscript._id}`}
                >
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{manuscript.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed{' '}
                        {format(new Date(manuscript.updatedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className="bg-success">Completed</Badge>
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

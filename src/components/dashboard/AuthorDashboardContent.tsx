'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Stats {
  totalSubmissions: number;
  underReview: number;
  accepted: number;
  revisionRequired: number;
}

interface Manuscript {
  _id: string;
  title: string;
  status: string;
  manuscriptType: string;
  createdAt: string;
  updatedAt: string;
}

export function AuthorDashboardContent() {
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
        fetch('/api/manuscripts?limit=5'),
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
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary-600">
              {stats?.totalSubmissions || 0}
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
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              {stats?.accepted || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Revision Required</CardDescription>
            <CardTitle className="text-3xl font-bold text-warning-500">
              {stats?.revisionRequired || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manuscripts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Manuscripts</CardTitle>
            <CardDescription>Recent submissions and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {manuscripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-muted-foreground text-center">
                  No manuscripts yet. Start by submitting your first manuscript!
                </p>
                <Link href="/submit">
                  <Button className="gradient-primary text-white">
                    Submit New Manuscript
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {manuscripts.map((manuscript) => (
                  <Link
                    key={manuscript._id}
                    href={`/manuscript/${manuscript._id}`}
                  >
                    <div className="p-4 border rounded-lg hover:bg-surface transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1 line-clamp-2">{manuscript.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {manuscript.manuscriptType.replace('-', ' ')}
                            </Badge>
                            <span>•</span>
                            <span>
                              {format(new Date(manuscript.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(manuscript.status)}>
                          {manuscript.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
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
            <Link href="/submit" className="block">
              <Button className="w-full justify-start" variant="outline">
                Submit New Manuscript
              </Button>
            </Link>
            <Link href="/author/manuscripts" className="block">
              <Button className="w-full justify-start" variant="outline">
                View All Manuscripts
              </Button>
            </Link>
            <Link href="/author/profile" className="block">
              <Button className="w-full justify-start" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

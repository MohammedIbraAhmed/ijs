'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  _id: string;
  name: string;
  email: string;
  profile: {
    affiliation?: string;
    expertise?: string[];
    orcid?: string;
  };
  stats: {
    reviews: number;
  };
}

interface Manuscript {
  _id: string;
  title: string;
  status: string;
  abstract: string;
  keywords?: string[];
  reviewers?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    status: string;
    invitedAt: string;
    deadline?: string;
  }>;
}

export default function AssignReviewersPage() {
  const params = useParams();
  const router = useRouter();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchManuscript();
    }
  }, [params.id]);

  const fetchManuscript = async () => {
    try {
      const response = await fetch(`/api/manuscripts/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch manuscript');
      }

      setManuscript(data.manuscript);
    } catch (err: any) {
      toast.error(err.message);
      router.push('/editor/manuscripts');
    } finally {
      setLoading(false);
    }
  };

  const searchReviewers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?query=${encodeURIComponent(searchQuery)}&role=reviewer`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      toast.error('Failed to search reviewers');
    } finally {
      setSearching(false);
    }
  };

  const toggleReviewer = (userId: string) => {
    const newSelected = new Set(selectedReviewers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedReviewers(newSelected);
  };

  const inviteReviewers = async () => {
    if (selectedReviewers.size === 0) {
      toast.error('Please select at least one reviewer');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(
        `/api/manuscripts/${params.id}/invite-reviewers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewers: Array.from(selectedReviewers).map((userId) => ({
              userId,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite reviewers');
      }

      toast.success(data.message);
      setSelectedReviewers(new Set());
      setSearchResults([]);
      setSearchQuery('');
      await fetchManuscript();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      invited: 'bg-accent-500',
      accepted: 'bg-warning-500',
      declined: 'bg-secondary-500',
      completed: 'bg-success',
    };
    return colors[status] || 'bg-secondary-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-error-500">Manuscript not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
            <Badge variant="outline">
              MS-{manuscript._id.substring(0, 8).toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Assign Reviewers
          </h1>
          <p className="text-muted-foreground">{manuscript.title}</p>
        </div>
      </div>

      {/* Manuscript Info */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscript Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Abstract</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {manuscript.abstract}
            </p>
          </div>
          {manuscript.keywords && manuscript.keywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {manuscript.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Reviewers */}
      {manuscript.reviewers && manuscript.reviewers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Reviewers ({manuscript.reviewers.length})</CardTitle>
            <CardDescription>Reviewers currently invited or working on this manuscript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {manuscript.reviewers.map((reviewer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{reviewer.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {reviewer.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invited {format(new Date(reviewer.invitedAt), 'MMM d, yyyy')}
                      {reviewer.deadline &&
                        ` • Due ${format(new Date(reviewer.deadline), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(reviewer.status)}>
                    {reviewer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Reviewers */}
      <Card>
        <CardHeader>
          <CardTitle>Find Reviewers</CardTitle>
          <CardDescription>
            Search for potential reviewers by name, affiliation, or expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search reviewers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchReviewers();
                }
              }}
            />
            <Button onClick={searchReviewers} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} reviewer(s) found
                </p>
                {selectedReviewers.size > 0 && (
                  <Button onClick={inviteReviewers} disabled={inviting}>
                    {inviting
                      ? 'Inviting...'
                      : `Invite ${selectedReviewers.size} Reviewer(s)`}
                  </Button>
                )}
              </div>

              {searchResults.map((user) => {
                const isSelected = selectedReviewers.has(user._id);
                const alreadyInvited = manuscript.reviewers?.some(
                  (r) => r.user._id === user._id
                );

                return (
                  <div
                    key={user._id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                        : 'hover:bg-surface'
                    } ${alreadyInvited ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{user.name}</p>
                          {alreadyInvited && (
                            <Badge variant="secondary" className="text-xs">
                              Already Invited
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        {user.profile.affiliation && (
                          <p className="text-sm text-muted-foreground">
                            {user.profile.affiliation}
                          </p>
                        )}
                        {user.profile.expertise &&
                          user.profile.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.profile.expertise.map((exp, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {user.stats?.reviews || 0} completed review(s)
                        </p>
                      </div>
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleReviewer(user._id)}
                        disabled={alreadyInvited}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <p className="text-center text-muted-foreground py-8">
              No reviewers found. Try a different search query.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Manuscript {
  _id: string;
  title: string;
  status: string;
  manuscriptType: string;
  createdAt: string;
  updatedAt: string;
  authors?: any[];
  abstract?: string;
}

export default function ManuscriptsListPage() {
  const router = useRouter();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchManuscripts();
  }, []);

  useEffect(() => {
    filterManuscripts();
  }, [manuscripts, searchQuery, statusFilter, typeFilter]);

  const fetchManuscripts = async () => {
    try {
      const response = await fetch('/api/manuscripts');
      const data = await response.json();

      if (data.success) {
        setManuscripts(data.manuscripts);
      }
    } catch (error) {
      console.error('Failed to fetch manuscripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterManuscripts = () => {
    let filtered = [...manuscripts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.manuscriptType === typeFilter);
    }

    setFilteredManuscripts(filtered);
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
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Your Manuscripts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your submissions
          </p>
        </div>
        <Button
          onClick={() => router.push('/submit')}
          className="gradient-primary text-white"
        >
          Submit New Manuscript
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search manuscripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="revision_required">Revision Required</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="research">Research Article</SelectItem>
                <SelectItem value="review">Review Article</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
                <SelectItem value="short-communication">Short Communication</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredManuscripts.length} Manuscript{filteredManuscripts.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Filtered results'
              : 'All your submissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredManuscripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground text-center">
                {manuscripts.length === 0
                  ? 'No manuscripts yet. Submit your first manuscript to get started!'
                  : 'No manuscripts match your filters.'}
              </p>
              {manuscripts.length === 0 && (
                <Button
                  onClick={() => router.push('/submit')}
                  className="gradient-primary text-white"
                >
                  Submit New Manuscript
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredManuscripts.map((manuscript) => (
                <div
                  key={manuscript._id}
                  onClick={() => router.push(`/manuscript/${manuscript._id}`)}
                  className="p-4 border rounded-lg hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          MS-{manuscript._id.substring(0, 8).toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(manuscript.status)}>
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
                          Submitted {format(new Date(manuscript.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span>
                          Updated {format(new Date(manuscript.updatedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/manuscript/${manuscript._id}`);
                      }}
                    >
                      View Details →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ManuscriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [manuscript, setManuscript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError(err.message);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container max-w-5xl mx-auto">
          <Card className="border-error-500">
            <CardContent className="pt-6">
              <p className="text-error-500">{error || 'Manuscript not found'}</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-5xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold mb-2">{manuscript.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge className={getStatusColor(manuscript.status)}>
                {manuscript.status.replace('_', ' ')}
              </Badge>
              <span>•</span>
              <span className="capitalize">
                {manuscript.manuscriptType.replace('-', ' ')}
              </span>
              <span>•</span>
              <span>Submitted {format(new Date(manuscript.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Abstract */}
        <Card>
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify whitespace-pre-wrap">{manuscript.abstract}</p>
          </CardContent>
        </Card>

        {/* Authors */}
        <Card>
          <CardHeader>
            <CardTitle>Authors ({manuscript.authors?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {manuscript.authors?.map((author: any, index: number) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{author.name}</p>
                    <p className="text-sm text-muted-foreground">{author.email}</p>
                    {author.affiliation && (
                      <p className="text-sm text-muted-foreground mt-1">{author.affiliation}</p>
                    )}
                  </div>
                  {author.corresponding && (
                    <Badge variant="secondary">Corresponding</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {manuscript.keywords?.map((keyword: string, index: number) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {manuscript.files?.manuscript && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">Manuscript</p>
                  <p className="text-sm text-muted-foreground">
                    {manuscript.files.manuscript.filename} (
                    {formatFileSize(manuscript.files.manuscript.size)})
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Download
                </Button>
              </div>
            )}

            {manuscript.files?.supplementary && manuscript.files.supplementary.length > 0 && (
              <div>
                <p className="font-medium mb-2">Supplementary Files</p>
                {manuscript.files.supplementary.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg mb-2">
                    <div>
                      <p className="text-sm">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        {manuscript.timeline && manuscript.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manuscript.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary-600" />
                      {index < manuscript.timeline.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manuscript ID:</span>
              <span className="font-mono">MS-{manuscript._id.substring(0, 8).toUpperCase()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted By:</span>
              <span>{manuscript.submittedBy?.name || 'Unknown'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission Date:</span>
              <span>{format(new Date(manuscript.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{format(new Date(manuscript.updatedAt), 'MMM d, yyyy')}</span>
            </div>
            {manuscript.assignedEditor && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Editor:</span>
                  <span>{manuscript.assignedEditor.name}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

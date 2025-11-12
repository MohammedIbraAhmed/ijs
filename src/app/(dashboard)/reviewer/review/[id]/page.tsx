'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { reviewSubmissionSchema, type ReviewSubmission } from '@/lib/validators/review';

interface Manuscript {
  _id: string;
  title: string;
  abstract: string;
  keywords?: string[];
  manuscriptType: string;
  authors?: Array<{
    name: string;
    email: string;
  }>;
  reviewers?: Array<{
    user: string;
    status: string;
    invitedAt: string;
    deadline?: string;
  }>;
  files?: {
    manuscript?: {
      filename: string;
      url: string;
      size: number;
    };
  };
}

export default function ReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [reviewerStatus, setReviewerStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReviewSubmission>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: {
      overallRecommendation: 'minor_revision',
      ratings: {
        originality: 3,
        methodology: 3,
        clarity: 3,
        significance: 3,
        references: 3,
      },
      comments: {
        strengths: '',
        weaknesses: '',
        suggestions: '',
        confidentialComments: '',
      },
    },
  });

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [manuscriptRes, reviewRes] = await Promise.all([
        fetch(`/api/manuscripts/${params.id}`),
        fetch(`/api/manuscripts/${params.id}/submit-review`),
      ]);

      const manuscriptData = await manuscriptRes.json();
      const reviewData = await reviewRes.json();

      if (!manuscriptRes.ok) {
        throw new Error(manuscriptData.error || 'Failed to fetch manuscript');
      }

      setManuscript(manuscriptData.manuscript);

      // Find reviewer status
      const reviewer = manuscriptData.manuscript.reviewers?.find(
        (r: any) => r.user._id === manuscriptData.manuscript._id
      );
      setReviewerStatus(reviewer?.status || 'invited');

      // Load existing review if available
      if (reviewData.success && reviewData.review) {
        form.reset({
          overallRecommendation: reviewData.review.content.overallRecommendation,
          ratings: reviewData.review.content.ratings,
          comments: reviewData.review.content.comments,
        });
      }
    } catch (err: any) {
      toast.error(err.message);
      router.push('/reviewer');
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (action: 'accept' | 'decline') => {
    setResponding(true);
    try {
      const response = await fetch(
        `/api/manuscripts/${params.id}/respond-invitation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} invitation`);
      }

      toast.success(data.message);
      setReviewerStatus(action === 'accept' ? 'accepted' : 'declined');

      if (action === 'decline') {
        router.push('/reviewer');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResponding(false);
    }
  };

  const onSubmit = async (data: ReviewSubmission) => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/manuscripts/${params.id}/submit-review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      toast.success(result.message);
      router.push('/reviewer');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput = ({ name, label }: { name: any; label: string }) => {
    const value = form.watch(name);
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => form.setValue(name, rating)}
              className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                value === rating
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-border hover:border-primary-400'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
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
            <Badge
              className={
                reviewerStatus === 'completed'
                  ? 'bg-success'
                  : reviewerStatus === 'accepted'
                  ? 'bg-warning-500'
                  : 'bg-accent-500'
              }
            >
              {reviewerStatus}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Review Manuscript</h1>
          <p className="text-muted-foreground">{manuscript.title}</p>
        </div>
      </div>

      {/* Invitation Response */}
      {reviewerStatus === 'invited' && (
        <Card className="border-accent-500">
          <CardHeader>
            <CardTitle>Review Invitation</CardTitle>
            <CardDescription>
              Please accept or decline this review invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={() => respondToInvitation('accept')}
                disabled={responding}
                className="gradient-primary text-white"
              >
                Accept Invitation
              </Button>
              <Button
                onClick={() => respondToInvitation('decline')}
                disabled={responding}
                variant="outline"
              >
                Decline Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manuscript Details */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscript Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Type</h4>
            <Badge variant="secondary" className="capitalize">
              {manuscript.manuscriptType.replace('-', ' ')}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium mb-1">Abstract</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {manuscript.abstract}
            </p>
          </div>
          {manuscript.keywords && manuscript.keywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {manuscript.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {manuscript.files?.manuscript && (
            <div>
              <h4 className="font-medium mb-2">Manuscript File</h4>
              <Button variant="outline" size="sm">
                Download Manuscript
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {(reviewerStatus === 'accepted' || reviewerStatus === 'completed') && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Recommendation</CardTitle>
              <CardDescription>
                Your final recommendation for this manuscript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'accept', label: 'Accept', color: 'bg-success' },
                  {
                    value: 'minor_revision',
                    label: 'Minor Revision',
                    color: 'bg-accent-500',
                  },
                  {
                    value: 'major_revision',
                    label: 'Major Revision',
                    color: 'bg-warning-500',
                  },
                  { value: 'reject', label: 'Reject', color: 'bg-error-500' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      form.setValue('overallRecommendation', option.value as any)
                    }
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      form.watch('overallRecommendation') === option.value
                        ? `${option.color} text-white border-transparent`
                        : 'border-border hover:border-primary-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Ratings (1-5 scale)</CardTitle>
              <CardDescription>
                Rate different aspects of the manuscript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RatingInput name="ratings.originality" label="Originality" />
              <Separator />
              <RatingInput name="ratings.methodology" label="Methodology & Rigor" />
              <Separator />
              <RatingInput name="ratings.clarity" label="Clarity & Writing Quality" />
              <Separator />
              <RatingInput name="ratings.significance" label="Significance & Impact" />
              <Separator />
              <RatingInput name="ratings.references" label="References & Citation" />
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
              <CardDescription>Detailed feedback for the authors and editors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths (minimum 50 characters)</Label>
                <Textarea
                  id="strengths"
                  {...form.register('comments.strengths')}
                  placeholder="Describe the strengths of this manuscript..."
                  className="min-h-[120px]"
                />
                {form.formState.errors.comments?.strengths && (
                  <p className="text-sm text-error-500">
                    {form.formState.errors.comments.strengths.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weaknesses">Weaknesses (minimum 50 characters)</Label>
                <Textarea
                  id="weaknesses"
                  {...form.register('comments.weaknesses')}
                  placeholder="Describe the weaknesses and areas for improvement..."
                  className="min-h-[120px]"
                />
                {form.formState.errors.comments?.weaknesses && (
                  <p className="text-sm text-error-500">
                    {form.formState.errors.comments.weaknesses.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions">
                  Suggestions for Improvement (minimum 50 characters)
                </Label>
                <Textarea
                  id="suggestions"
                  {...form.register('comments.suggestions')}
                  placeholder="Provide specific suggestions for improving the manuscript..."
                  className="min-h-[120px]"
                />
                {form.formState.errors.comments?.suggestions && (
                  <p className="text-sm text-error-500">
                    {form.formState.errors.comments.suggestions.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidential">
                  Confidential Comments to Editor (Optional)
                </Label>
                <Textarea
                  id="confidential"
                  {...form.register('comments.confidentialComments')}
                  placeholder="Comments that will only be visible to the editor..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  These comments will not be shared with the authors
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gradient-primary text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {reviewerStatus === 'declined' && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              You have declined this review invitation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

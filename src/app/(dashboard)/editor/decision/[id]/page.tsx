'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Review {
  _id: string;
  reviewer: {
    name: string;
    email: string;
    profile?: {
      affiliation?: string;
    };
  };
  content: {
    overallRecommendation: string;
    ratings: {
      originality: number;
      methodology: number;
      clarity: number;
      significance: number;
      references: number;
    };
    comments: {
      strengths: string;
      weaknesses: string;
      suggestions: string;
      confidentialComments?: string;
    };
  };
  submittedAt: string;
}

interface Manuscript {
  _id: string;
  title: string;
  abstract: string;
  status: string;
  submittedBy: {
    name: string;
    email: string;
  };
}

export default function EditorialDecisionPage() {
  const params = useParams();
  const router = useRouter();
  const [manuscript, setManuscript] = useState<Manuscript | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [decision, setDecision] = useState<string>('');
  const [revisionType, setRevisionType] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [manuscriptRes, reviewsRes] = await Promise.all([
        fetch(`/api/manuscripts/${params.id}`),
        fetch(`/api/manuscripts/${params.id}/reviews`),
      ]);

      const manuscriptData = await manuscriptRes.json();
      const reviewsData = await reviewsRes.json();

      if (!manuscriptRes.ok) {
        throw new Error(manuscriptData.error || 'Failed to fetch manuscript');
      }

      setManuscript(manuscriptData.manuscript);

      if (reviewsData.success) {
        setReviews(reviewsData.reviews);
      }
    } catch (err: any) {
      toast.error(err.message);
      router.push('/editor/manuscripts');
    } finally {
      setLoading(false);
    }
  };

  const submitDecision = async () => {
    if (!decision) {
      toast.error('Please select a decision');
      return;
    }

    if (!feedback || feedback.length < 50) {
      toast.error('Please provide detailed feedback (at least 50 characters)');
      return;
    }

    if (decision === 'revision_required' && !revisionType) {
      toast.error('Please select revision type');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/manuscripts/${params.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          feedback,
          revisionType: decision === 'revision_required' ? revisionType : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit decision');
      }

      toast.success(data.message);
      router.push('/editor/manuscripts');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors: Record<string, string> = {
      accept: 'bg-success',
      minor_revision: 'bg-accent-500',
      major_revision: 'bg-warning-500',
      reject: 'bg-error-500',
    };
    return colors[recommendation] || 'bg-secondary-500';
  };

  const RatingDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
              star <= value
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-200 text-secondary-500'
            }`}
          >
            {star}
          </div>
        ))}
      </div>
    </div>
  );

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

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => {
          const ratings = review.content.ratings;
          return (
            acc +
            (ratings.originality +
              ratings.methodology +
              ratings.clarity +
              ratings.significance +
              ratings.references) /
              5
          );
        }, 0) / reviews.length
      : 0;

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
            Make Editorial Decision
          </h1>
          <p className="text-muted-foreground">{manuscript.title}</p>
        </div>
      </div>

      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Summary</CardTitle>
          <CardDescription>
            {reviews.length} review(s) submitted • Average rating:{' '}
            {averageRating.toFixed(1)}/5
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Reviews */}
      {reviews.map((review, index) => (
        <Card key={review._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Review {index + 1}</CardTitle>
                <CardDescription>
                  By {review.reviewer.name}
                  {review.reviewer.profile?.affiliation &&
                    ` • ${review.reviewer.profile.affiliation}`}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted {format(new Date(review.submittedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge className={getRecommendationColor(review.content.overallRecommendation)}>
                {review.content.overallRecommendation.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ratings */}
            <div>
              <h4 className="font-medium mb-3">Ratings</h4>
              <div className="space-y-2">
                <RatingDisplay
                  label="Originality"
                  value={review.content.ratings.originality}
                />
                <RatingDisplay
                  label="Methodology"
                  value={review.content.ratings.methodology}
                />
                <RatingDisplay label="Clarity" value={review.content.ratings.clarity} />
                <RatingDisplay
                  label="Significance"
                  value={review.content.ratings.significance}
                />
                <RatingDisplay
                  label="References"
                  value={review.content.ratings.references}
                />
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Strengths</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.content.comments.strengths}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Weaknesses</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.content.comments.weaknesses}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Suggestions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.content.comments.suggestions}
                </p>
              </div>

              {review.content.comments.confidentialComments && (
                <div className="p-4 bg-accent-50 dark:bg-accent-950 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Confidential
                    </Badge>
                    Comments to Editor
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {review.content.comments.confidentialComments}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No reviews submitted yet. Please wait for reviewers to complete their
              reviews before making a decision.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Editorial Decision Form */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Decision</CardTitle>
            <CardDescription>
              Make your editorial decision based on the reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">Accept</SelectItem>
                  <SelectItem value="revision_required">
                    Revision Required
                  </SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {decision === 'revision_required' && (
              <div className="space-y-2">
                <Label htmlFor="revisionType">Revision Type</Label>
                <Select value={revisionType} onValueChange={setRevisionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select revision type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor Revision</SelectItem>
                    <SelectItem value="major">Major Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">
                Feedback to Authors (minimum 50 characters)
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback to the authors based on the reviews..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                {feedback.length} characters
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={submitDecision}
                disabled={submitting}
                className="gradient-primary text-white"
              >
                {submitting ? 'Submitting...' : 'Submit Decision'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

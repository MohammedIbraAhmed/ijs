import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';
import Review from '@/lib/models/Review';
import { reviewSubmissionSchema } from '@/lib/validators/review';
import { z } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only reviewers can submit reviews
    if (session.user.role !== 'reviewer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const validatedData = reviewSubmissionSchema.parse(body);

    const manuscript = await Manuscript.findById(params.id);

    if (!manuscript) {
      return NextResponse.json(
        { error: 'Manuscript not found' },
        { status: 404 }
      );
    }

    // Find the reviewer in the manuscript
    const reviewerIndex = manuscript.reviewers.findIndex(
      (r: any) => r.user.toString() === session.user.id
    );

    if (reviewerIndex === -1) {
      return NextResponse.json(
        { error: 'You are not assigned to review this manuscript' },
        { status: 403 }
      );
    }

    const reviewer = manuscript.reviewers[reviewerIndex];

    // Check if reviewer has accepted the invitation
    if (reviewer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'You must accept the invitation before submitting a review' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      manuscript: params.id,
      reviewer: session.user.id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.content = {
        overallRecommendation: validatedData.overallRecommendation,
        ratings: validatedData.ratings,
        comments: validatedData.comments,
      };
      existingReview.submittedAt = new Date();
      existingReview.status = 'completed';

      // Add to revision history
      existingReview.revisionHistory.push({
        version: existingReview.revisionHistory.length + 1,
        submittedAt: new Date(),
        content: existingReview.content,
      });

      await existingReview.save();
    } else {
      // Create new review
      await Review.create({
        manuscript: params.id,
        reviewer: session.user.id,
        invitation: {
          sentAt: reviewer.invitedAt,
          deadline: reviewer.deadline,
          status: 'accepted',
        },
        content: {
          overallRecommendation: validatedData.overallRecommendation,
          ratings: validatedData.ratings,
          comments: validatedData.comments,
        },
        submittedAt: new Date(),
        status: 'completed',
      });
    }

    // Update reviewer status in manuscript
    reviewer.status = 'completed';
    reviewer.completedAt = new Date();

    // Add timeline event
    const timelineEvent = {
      event: 'Review submitted',
      date: new Date(),
      actor: session.user.id,
    };
    manuscript.timeline.push(timelineEvent);

    await manuscript.save();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET route to fetch existing review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const review = await Review.findOne({
      manuscript: params.id,
      reviewer: session.user.id,
    }).lean();

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Fetch review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

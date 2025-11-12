import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';
import { z } from 'zod';

const respondInvitationSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only reviewers can respond to invitations
    if (session.user.role !== 'reviewer') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const validatedData = respondInvitationSchema.parse(body);

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
        { error: 'You are not invited to review this manuscript' },
        { status: 403 }
      );
    }

    const reviewer = manuscript.reviewers[reviewerIndex];

    // Check if already responded
    if (reviewer.status !== 'invited') {
      return NextResponse.json(
        { error: `You have already ${reviewer.status} this invitation` },
        { status: 400 }
      );
    }

    // Update reviewer status
    reviewer.status = validatedData.action === 'accept' ? 'accepted' : 'declined';
    reviewer.respondedAt = new Date();

    // Add timeline event
    const timelineEvent = {
      event: `Reviewer ${validatedData.action}ed invitation`,
      date: new Date(),
      actor: session.user.id,
    };
    manuscript.timeline.push(timelineEvent);

    await manuscript.save();

    return NextResponse.json({
      success: true,
      message: `Successfully ${validatedData.action}ed the review invitation`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Respond invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to invitation' },
      { status: 500 }
    );
  }
}

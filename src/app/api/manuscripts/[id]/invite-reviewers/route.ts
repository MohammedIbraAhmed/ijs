import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';
import { z } from 'zod';

const inviteReviewersSchema = z.object({
  reviewers: z.array(
    z.object({
      userId: z.string(),
      deadline: z.string().optional(),
    })
  ).min(1),
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

    // Only editors can invite reviewers
    if (session.user.role !== 'editor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const validatedData = inviteReviewersSchema.parse(body);

    const manuscript = await Manuscript.findById(params.id);

    if (!manuscript) {
      return NextResponse.json(
        { error: 'Manuscript not found' },
        { status: 404 }
      );
    }

    // Check if manuscript is in a valid status for reviewer assignment
    if (manuscript.status === 'draft') {
      return NextResponse.json(
        { error: 'Cannot assign reviewers to draft manuscripts' },
        { status: 400 }
      );
    }

    // Prepare reviewer invitations
    const newReviewers = validatedData.reviewers.map((reviewer) => ({
      user: reviewer.userId,
      status: 'invited',
      invitedAt: new Date(),
      deadline: reviewer.deadline
        ? new Date(reviewer.deadline)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default: 14 days from now
    }));

    // Add new reviewers (avoid duplicates)
    const existingReviewerIds = manuscript.reviewers.map((r: any) =>
      r.user.toString()
    );

    const reviewersToAdd = newReviewers.filter(
      (r) => !existingReviewerIds.includes(r.user)
    );

    if (reviewersToAdd.length === 0) {
      return NextResponse.json(
        { error: 'All selected reviewers have already been invited' },
        { status: 400 }
      );
    }

    manuscript.reviewers.push(...reviewersToAdd);

    // Update status to under_review if submitted
    if (manuscript.status === 'submitted') {
      manuscript.status = 'under_review';
    }

    // Add timeline event
    const timelineEvent = {
      event: `${reviewersToAdd.length} reviewer(s) invited`,
      date: new Date(),
      actor: session.user.id,
    };
    manuscript.timeline.push(timelineEvent);

    await manuscript.save();

    return NextResponse.json({
      success: true,
      message: `Successfully invited ${reviewersToAdd.length} reviewer(s)`,
      manuscript: await Manuscript.findById(params.id)
        .populate('submittedBy', 'name email')
        .populate('assignedEditor', 'name email')
        .populate('reviewers.user', 'name email profile.affiliation')
        .lean(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Invite reviewers error:', error);
    return NextResponse.json(
      { error: 'Failed to invite reviewers' },
      { status: 500 }
    );
  }
}

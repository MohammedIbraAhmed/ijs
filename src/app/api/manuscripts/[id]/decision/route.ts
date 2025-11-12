import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';
import { z } from 'zod';

const decisionSchema = z.object({
  decision: z.enum(['accepted', 'revision_required', 'rejected']),
  feedback: z.string().min(50, 'Please provide detailed feedback (at least 50 characters)'),
  revisionType: z.enum(['minor', 'major']).optional(),
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

    // Only editors can make decisions
    if (session.user.role !== 'editor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const validatedData = decisionSchema.parse(body);

    const manuscript = await Manuscript.findById(params.id);

    if (!manuscript) {
      return NextResponse.json(
        { error: 'Manuscript not found' },
        { status: 404 }
      );
    }

    // Check if manuscript is in a valid status for decision
    if (!['under_review', 'revision_required'].includes(manuscript.status)) {
      return NextResponse.json(
        { error: 'Manuscript is not ready for editorial decision' },
        { status: 400 }
      );
    }

    // Update manuscript status
    manuscript.status = validatedData.decision;

    // Add editorial decision to history
    const decisionEntry = {
      editor: session.user.id,
      decision:
        validatedData.decision === 'accepted'
          ? 'accept'
          : validatedData.decision === 'rejected'
          ? 'reject'
          : 'revision',
      comments: validatedData.feedback,
      date: new Date(),
    };

    if (!manuscript.editorialDecisions) {
      manuscript.editorialDecisions = [];
    }
    manuscript.editorialDecisions.push(decisionEntry as any);

    // Assign editor if not already assigned
    if (!manuscript.assignedEditor) {
      manuscript.assignedEditor = session.user.id;
    }

    // Add timeline event
    const timelineEvent = {
      event: `Editorial decision: ${validatedData.decision}`,
      date: new Date(),
      actor: session.user.id,
    };
    manuscript.timeline.push(timelineEvent);

    await manuscript.save();

    return NextResponse.json({
      success: true,
      message: 'Editorial decision submitted successfully',
      manuscript: await Manuscript.findById(params.id)
        .populate('submittedBy', 'name email')
        .populate('assignedEditor', 'name email')
        .populate('reviewers.user', 'name email')
        .lean(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid decision data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Submit decision error:', error);
    return NextResponse.json(
      { error: 'Failed to submit decision' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';

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

    const manuscript = await Manuscript.findById(params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedEditor', 'name email')
      .populate('reviewers.user', 'name email')
      .lean();

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    // Check access permissions
    const userRole = session.user.role;
    const userId = session.user.id;

    const isAuthor = manuscript.submittedBy._id.toString() === userId;
    const isAssignedEditor = manuscript.assignedEditor?._id?.toString() === userId;
    const isReviewer = manuscript.reviewers?.some(
      (r: any) => r.user._id.toString() === userId
    );

    if (userRole === 'author' && !isAuthor) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (userRole === 'reviewer' && !isReviewer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Editors can see all submitted manuscripts
    if (userRole === 'editor' && manuscript.status === 'draft') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      manuscript,
    });
  } catch (error) {
    console.error('Fetch manuscript error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manuscript' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = session.user.id;
    const userRole = session.user.role;

    let stats: any = {};

    if (userRole === 'author') {
      // Author statistics
      const [
        total,
        underReview,
        accepted,
        revisionRequired,
        rejected,
      ] = await Promise.all([
        Manuscript.countDocuments({ submittedBy: userId }),
        Manuscript.countDocuments({ submittedBy: userId, status: 'under_review' }),
        Manuscript.countDocuments({ submittedBy: userId, status: 'accepted' }),
        Manuscript.countDocuments({ submittedBy: userId, status: 'revision_required' }),
        Manuscript.countDocuments({ submittedBy: userId, status: 'rejected' }),
      ]);

      stats = {
        totalSubmissions: total,
        underReview,
        accepted,
        revisionRequired,
        rejected,
      };
    } else if (userRole === 'reviewer') {
      // Reviewer statistics
      const [
        totalReviews,
        pendingReviews,
        completedReviews,
      ] = await Promise.all([
        Manuscript.countDocuments({ 'reviewers.user': userId }),
        Manuscript.countDocuments({
          'reviewers.user': userId,
          'reviewers.status': { $in: ['invited', 'accepted'] },
        }),
        Manuscript.countDocuments({
          'reviewers.user': userId,
          'reviewers.status': 'completed',
        }),
      ]);

      stats = {
        totalReviews,
        pendingReviews,
        completedReviews,
      };
    } else if (userRole === 'editor') {
      // Editor statistics
      const [
        newSubmissions,
        underReview,
        awaitingDecision,
        totalManaged,
      ] = await Promise.all([
        Manuscript.countDocuments({ status: 'submitted' }),
        Manuscript.countDocuments({ status: 'under_review' }),
        Manuscript.countDocuments({ status: 'revision_required' }),
        Manuscript.countDocuments({ assignedEditor: userId }),
      ]);

      stats = {
        newSubmissions,
        underReview,
        awaitingDecision,
        totalManaged,
      };
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

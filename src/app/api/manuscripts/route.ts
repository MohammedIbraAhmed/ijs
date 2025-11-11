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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build query based on user role
    let query: any = {};

    if (session.user.role === 'author') {
      query.submittedBy = session.user.id;
    } else if (session.user.role === 'reviewer') {
      query['reviewers.user'] = session.user.id;
    } else if (session.user.role === 'editor') {
      // Editors can see all submitted manuscripts
      query.status = { $in: ['submitted', 'under_review', 'revision_required'] };
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const manuscripts = await Manuscript.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('title abstract status manuscriptType submittedBy createdAt updatedAt authors keywords')
      .populate('submittedBy', 'name email')
      .lean();

    const total = await Manuscript.countDocuments(query);

    return NextResponse.json({
      success: true,
      manuscripts,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit,
      },
    });
  } catch (error) {
    console.error('Fetch manuscripts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manuscripts' },
      { status: 500 }
    );
  }
}

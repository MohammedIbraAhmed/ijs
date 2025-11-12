import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only editors can search for reviewers
    if (session.user.role !== 'editor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const expertise = searchParams.get('expertise') || '';
    const role = searchParams.get('role') || 'reviewer';
    const limit = parseInt(searchParams.get('limit') || '20');

    let searchQuery: any = { role };

    // Build search conditions
    const conditions = [];

    if (query) {
      conditions.push({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { 'profile.affiliation': { $regex: query, $options: 'i' } },
        ],
      });
    }

    if (expertise) {
      conditions.push({
        'profile.expertise': { $regex: expertise, $options: 'i' },
      });
    }

    if (conditions.length > 0) {
      searchQuery = { ...searchQuery, $and: conditions };
    }

    const users = await User.find(searchQuery)
      .select('name email profile.affiliation profile.expertise profile.orcid stats.reviews')
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}

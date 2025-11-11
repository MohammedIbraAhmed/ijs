import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ReviewerDashboardContent } from '@/components/dashboard/ReviewerDashboardContent';

export default async function ReviewerDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gradient">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Reviewer Dashboard - Manage your manuscript reviews
        </p>
      </div>

      {/* Dashboard Content */}
      <ReviewerDashboardContent />
    </div>
  );
}

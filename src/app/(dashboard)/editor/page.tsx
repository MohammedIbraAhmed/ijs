import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { EditorDashboardContent } from '@/components/dashboard/EditorDashboardContent';

export default async function EditorDashboard() {
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
          Editor Dashboard - Manage submissions and reviews
        </p>
      </div>

      {/* Dashboard Content */}
      <EditorDashboardContent />
    </div>
  );
}

import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New Submissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary-600">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent-500">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Awaiting Decision</CardDescription>
            <CardTitle className="text-3xl font-bold text-warning-500">0</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Managed</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest manuscripts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
              <p className="text-muted-foreground text-center">
                No new submissions at this time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Editorial management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              View All Submissions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Assign Reviewers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Review Decisions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Manage Issues
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Review Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Review Status Overview</CardTitle>
          <CardDescription>Track the progress of manuscripts under review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-muted-foreground text-center">
              No manuscripts under review at this time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

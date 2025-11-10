import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details and role information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image} alt={session.user.name} />
              <AvatarFallback className="gradient-primary text-white text-2xl">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{session.user.name}</h3>
              <p className="text-muted-foreground">{session.user.email}</p>
              <Badge variant="secondary" className="capitalize">
                {session.user.role}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">User ID</div>
              <div className="col-span-2 text-sm">{session.user.id}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Full Name</div>
              <div className="col-span-2 text-sm">{session.user.name}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="col-span-2 text-sm">{session.user.email}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">Role</div>
              <div className="col-span-2 text-sm capitalize">{session.user.role}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Your activity on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-3xl font-bold text-primary-600">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Accepted Papers</p>
              <p className="text-3xl font-bold text-success">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="text-3xl font-bold text-accent-500">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

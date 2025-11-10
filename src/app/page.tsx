import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 py-20">
          <h1 className="text-6xl font-bold">
            <span className="text-gradient">Scientific Journal</span>
            <br />
            <span className="text-foreground">Publishing System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern platform for managing manuscript submissions, peer review, and
            publication. Streamline your scholarly publishing workflow.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="gradient-primary text-white hover:opacity-90 transition-opacity h-12 px-8"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-20">
          <Card className="border-border/50 hover:border-primary-500/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                A
              </div>
              <h3 className="text-xl font-semibold">For Authors</h3>
              <p className="text-muted-foreground">
                Submit manuscripts with ease. Track your submissions through the entire
                review process with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary-500/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center text-white text-2xl font-bold">
                R
              </div>
              <h3 className="text-xl font-semibold">For Reviewers</h3>
              <p className="text-muted-foreground">
                Review manuscripts efficiently with our intuitive interface. Manage
                deadlines and provide structured feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-primary-500/50 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-success text-white flex items-center justify-center text-2xl font-bold">
                E
              </div>
              <h3 className="text-xl font-semibold">For Editors</h3>
              <p className="text-muted-foreground">
                Manage submissions, assign reviewers, and make editorial decisions all
                in one place. Stay organized effortlessly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-12 border-t border-border/50">
          <p className="text-muted-foreground">
            Scientific Journal Publishing System &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
}

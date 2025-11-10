'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const roleBasedHome = `/${session.user.role}`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-6">
          <Link href={roleBasedHome} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SJ</span>
            </div>
            <span className="hidden font-bold sm:inline-block text-foreground">
              Scientific Journal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
            <Link
              href={roleBasedHome}
              className={`transition-colors hover:text-foreground/80 ${
                pathname === roleBasedHome
                  ? 'text-foreground'
                  : 'text-foreground/60'
              }`}
            >
              Dashboard
            </Link>
            {session.user.role === 'author' && (
              <Link
                href="/submit"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === '/submit'
                    ? 'text-foreground'
                    : 'text-foreground/60'
                }`}
              >
                Submit
              </Link>
            )}
          </div>
        </div>

        {/* Right Side - Theme Toggle and User Menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image} alt={session.user.name} />
                    <AvatarFallback className="gradient-primary text-white">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                      Role: {session.user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`${roleBasedHome}/profile`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${roleBasedHome}/settings`}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-error-500 cursor-pointer"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={session.user.image}
                        alt={session.user.name}
                      />
                      <AvatarFallback className="gradient-primary text-white">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.user.role}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-2">
                    <Link href={roleBasedHome}>
                      <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    {session.user.role === 'author' && (
                      <Link href="/submit">
                        <Button variant="ghost" className="w-full justify-start">
                          Submit Manuscript
                        </Button>
                      </Link>
                    )}
                    <Link href={`${roleBasedHome}/profile`}>
                      <Button variant="ghost" className="w-full justify-start">
                        Profile
                      </Button>
                    </Link>
                    <Link href={`${roleBasedHome}/settings`}>
                      <Button variant="ghost" className="w-full justify-start">
                        Settings
                      </Button>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    className="w-full text-error-500 border-error-500 hover:bg-error-500/10"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

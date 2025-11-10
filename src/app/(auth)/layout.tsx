import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Scientific Journal System',
  description: 'Login or register to access the scientific journal publishing system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      {children}
    </div>
  );
}

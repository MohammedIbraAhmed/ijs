import 'next-auth';
import 'next-auth/jwt';
import { UserRole } from './index';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
    name: string;
    image?: string;
  }
}

# Scientific Journal Publishing System

A modern, full-stack web application for managing the complete lifecycle of scientific manuscript submissions, peer review, and publication.

## Features

- **Manuscript Submission**: Multi-step submission workflow with file uploads
- **Peer Review System**: Blind review support with reviewer assignment
- **Editorial Dashboard**: Comprehensive tools for editors to manage submissions
- **Role-Based Access**: Author, Reviewer, Editor, and Admin roles
- **Real-time Updates**: Timeline tracking and notifications
- **Modern UI**: Sleek, responsive design with dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **UI**: Shadcn/ui + Tailwind CSS v4
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5
- **File Storage**: Cloudflare R2 / AWS S3
- **Email**: Resend with React Email

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ijs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- Other optional services (email, file storage)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ijs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Role-specific dashboards
│   │   ├── submit/            # Manuscript submission
│   │   ├── manuscript/        # Manuscript details
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── layout/            # Layout components
│   │   ├── forms/             # Form components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/
│   │   ├── mongodb/           # Database connection
│   │   ├── models/            # Mongoose models
│   │   ├── auth/              # Authentication config
│   │   └── utils/             # Utility functions
│   ├── types/                 # TypeScript definitions
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
└── emails/                    # Email templates
```

## Database Models

### User
- Authentication and profile information
- Role-based access control
- Preferences and statistics

### Manuscript
- Submission metadata
- Author information
- File attachments and versions
- Review assignments
- Editorial decisions
- Timeline tracking

### Review
- Reviewer assignments
- Review content and ratings
- Deadlines and status tracking
- Revision history

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Design System

The application uses a comprehensive design system with:
- **Color Palette**: Indigo/Violet gradients with slate grays
- **Typography**: Geist Sans and Mono fonts
- **Dark Mode**: Automatic theme switching
- **Custom Utilities**: Gradients, glass effects, animations

## Environment Variables

See `.env.example` for a complete list of configuration options.

Required:
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret for session encryption

Optional:
- Email service configuration (Resend)
- File storage (Cloudflare R2 or AWS S3)
- DOI and ORCID integration

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

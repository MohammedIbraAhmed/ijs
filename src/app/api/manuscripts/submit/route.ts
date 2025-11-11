import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/mongodb/connect';
import Manuscript from '@/lib/models/Manuscript';
import { manuscriptSubmissionSchema } from '@/lib/validators/manuscript';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const dataString = formData.get('data') as string;
    const manuscriptData = JSON.parse(dataString);

    // Validate data
    const validatedData = manuscriptSubmissionSchema.parse(manuscriptData);

    // Handle file uploads (for now, we'll store file metadata)
    // In production, you would upload to S3/R2 and store URLs
    const manuscriptFile = formData.get('manuscript') as File | null;
    const coverLetterFile = formData.get('coverLetter') as File | null;

    const files: any = {};

    if (manuscriptFile) {
      files.manuscript = {
        filename: manuscriptFile.name,
        size: manuscriptFile.size,
        mimeType: manuscriptFile.type,
        uploadedAt: new Date(),
        // In production: url: await uploadToS3(manuscriptFile)
        url: `/uploads/${manuscriptFile.name}`, // Placeholder
      };
    }

    if (coverLetterFile) {
      files.coverLetter = {
        filename: coverLetterFile.name,
        size: coverLetterFile.size,
        mimeType: coverLetterFile.type,
        uploadedAt: new Date(),
        url: `/uploads/${coverLetterFile.name}`, // Placeholder
      };
    }

    // Handle supplementary files
    const supplementary: any[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('supplementary_')) {
        const file = value as File;
        supplementary.push({
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
          url: `/uploads/${file.name}`, // Placeholder
        });
      }
    }

    if (supplementary.length > 0) {
      files.supplementary = supplementary;
    }

    // Create manuscript
    const manuscript = await Manuscript.create({
      ...validatedData,
      files,
      submittedBy: session.user.id,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          date: new Date(),
          files: {
            manuscript: files.manuscript,
            supplementary: files.supplementary || [],
          },
        },
      ],
      timeline: [
        {
          event:
            validatedData.status === 'draft'
              ? 'Draft created'
              : 'Manuscript submitted',
          actor: session.user.id,
          date: new Date(),
        },
      ],
    });

    // If submitted (not draft), add submitted event
    if (validatedData.status === 'submitted') {
      manuscript.status = 'submitted';
      await manuscript.save();
    }

    return NextResponse.json(
      {
        success: true,
        message:
          validatedData.status === 'draft'
            ? 'Draft saved successfully'
            : 'Manuscript submitted successfully',
        manuscript: {
          id: manuscript._id,
          title: manuscript.title,
          status: manuscript.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Manuscript submission error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit manuscript' },
      { status: 500 }
    );
  }
}

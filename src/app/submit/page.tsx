'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ManuscriptSubmissionFormData, manuscriptSubmissionSchema } from '@/lib/validators/manuscript';
import { BasicInfoStep } from '@/components/forms/submission/BasicInfoStep';
import { AuthorsStep } from '@/components/forms/submission/AuthorsStep';
import { KeywordsStep } from '@/components/forms/submission/KeywordsStep';
import { FilesStep } from '@/components/forms/submission/FilesStep';
import { ReviewersStep } from '@/components/forms/submission/ReviewersStep';
import { ReviewStep } from '@/components/forms/submission/ReviewStep';

const STEPS = [
  { id: 1, name: 'Basic Information', description: 'Title, abstract, and type' },
  { id: 2, name: 'Authors', description: 'Add manuscript authors' },
  { id: 3, name: 'Keywords', description: 'Add relevant keywords' },
  { id: 4, name: 'Files', description: 'Upload manuscript files' },
  { id: 5, name: 'Reviewers', description: 'Suggest reviewers (optional)' },
  { id: 6, name: 'Review', description: 'Review and submit' },
];

export default function SubmitManuscriptPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    manuscript?: File;
    supplementary: File[];
    coverLetter?: File;
  }>({ supplementary: [] });

  const form = useForm<ManuscriptSubmissionFormData>({
    resolver: zodResolver(manuscriptSubmissionSchema),
    defaultValues: {
      title: '',
      abstract: '',
      manuscriptType: 'research',
      authors: [
        {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          affiliation: '',
          corresponding: true,
        },
      ],
      keywords: [],
      suggestedReviewers: [],
      status: 'draft',
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof ManuscriptSubmissionFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title', 'abstract', 'manuscriptType'];
        break;
      case 2:
        fieldsToValidate = ['authors'];
        break;
      case 3:
        fieldsToValidate = ['keywords'];
        break;
      case 4:
        // File validation handled in FilesStep
        if (!uploadedFiles.manuscript) {
          toast.error('Please upload the manuscript file');
          return;
        }
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        toast.error('Please fix the errors before continuing');
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ManuscriptSubmissionFormData) => {
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Append form fields
      formData.append('data', JSON.stringify(data));

      // Append files
      if (uploadedFiles.manuscript) {
        formData.append('manuscript', uploadedFiles.manuscript);
      }
      if (uploadedFiles.coverLetter) {
        formData.append('coverLetter', uploadedFiles.coverLetter);
      }
      uploadedFiles.supplementary.forEach((file, index) => {
        formData.append(`supplementary_${index}`, file);
      });

      const response = await fetch('/api/manuscripts/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit manuscript');
      }

      toast.success('Manuscript submitted successfully!');
      router.push('/author');
      router.refresh();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit manuscript');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const data = form.getValues();
    data.status = 'draft';

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      if (uploadedFiles.manuscript) {
        formData.append('manuscript', uploadedFiles.manuscript);
      }

      const response = await fetch('/api/manuscripts/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Submit Manuscript</h1>
          <p className="text-muted-foreground">
            Follow the steps below to submit your manuscript for review
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-8 hidden md:block">
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? 'text-primary-600'
                    : step.id < currentStep
                    ? 'text-success'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                    step.id === currentStep
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : step.id < currentStep
                      ? 'border-success bg-success/10'
                      : 'border-border'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="text-xs text-center hidden lg:block">{step.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step Content */}
              {currentStep === 1 && <BasicInfoStep form={form} />}
              {currentStep === 2 && <AuthorsStep form={form} />}
              {currentStep === 3 && <KeywordsStep form={form} />}
              {currentStep === 4 && (
                <FilesStep
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                />
              )}
              {currentStep === 5 && <ReviewersStep form={form} />}
              {currentStep === 6 && (
                <ReviewStep form={form} uploadedFiles={uploadedFiles} />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  <Button type="button" variant="ghost" onClick={saveDraft}>
                    Save Draft
                  </Button>
                </div>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="gradient-primary">
                    {isSubmitting ? 'Submitting...' : 'Submit Manuscript'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

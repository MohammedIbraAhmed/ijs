import { UseFormReturn } from 'react-hook-form';
import { ManuscriptSubmissionFormData } from '@/lib/validators/manuscript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ReviewStepProps {
  form: UseFormReturn<ManuscriptSubmissionFormData>;
  uploadedFiles: {
    manuscript?: File;
    supplementary: File[];
    coverLetter?: File;
  };
}

export function ReviewStep({ form, uploadedFiles }: ReviewStepProps) {
  const data = form.getValues();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Submission</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please review all information before submitting your manuscript
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Title</p>
            <p className="text-sm mt-1">{data.title}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              {data.manuscriptType?.replace('-', ' ')}
            </Badge>
          </div>
          {data.category && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-sm mt-1">{data.category}</p>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Abstract</p>
            <p className="text-sm mt-1 text-justify">{data.abstract}</p>
          </div>
        </CardContent>
      </Card>

      {/* Authors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authors ({data.authors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.authors?.map((author, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{author.name}</p>
                  <p className="text-xs text-muted-foreground">{author.email}</p>
                  {author.affiliation && (
                    <p className="text-xs text-muted-foreground mt-1">{author.affiliation}</p>
                  )}
                </div>
                {author.corresponding && (
                  <Badge variant="default" className="text-xs">
                    Corresponding
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Keywords ({data.keywords?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploadedFiles.manuscript && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-surface">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-primary-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">Manuscript</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFiles.manuscript.name} (
                  {formatFileSize(uploadedFiles.manuscript.size)})
                </p>
              </div>
            </div>
          )}

          {uploadedFiles.coverLetter && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-surface">
              <div className="flex-1">
                <p className="text-sm font-medium">Cover Letter</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFiles.coverLetter.name} (
                  {formatFileSize(uploadedFiles.coverLetter.size)})
                </p>
              </div>
            </div>
          )}

          {uploadedFiles.supplementary.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Supplementary Files ({uploadedFiles.supplementary.length})
              </p>
              {uploadedFiles.supplementary.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg mb-2">
                  <p className="text-xs flex-1">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Reviewers */}
      {data.suggestedReviewers && data.suggestedReviewers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Suggested Reviewers ({data.suggestedReviewers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.suggestedReviewers.map((reviewer, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">{reviewer.name}</p>
                  <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                  {reviewer.affiliation && (
                    <p className="text-xs text-muted-foreground mt-1">{reviewer.affiliation}</p>
                  )}
                  {reviewer.expertise && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expertise: {reviewer.expertise}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation */}
      <Card className="border-primary-500/50 bg-primary-50 dark:bg-primary-900/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Ready to Submit?</p>
              <p className="text-muted-foreground">
                By submitting this manuscript, you confirm that all information is accurate and
                that all authors have approved the submission. Click "Submit Manuscript" below to
                complete your submission.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

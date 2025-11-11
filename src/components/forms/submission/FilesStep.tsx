import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FilesStepProps {
  uploadedFiles: {
    manuscript?: File;
    supplementary: File[];
    coverLetter?: File;
  };
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<{
      manuscript?: File;
      supplementary: File[];
      coverLetter?: File;
    }>
  >;
}

export function FilesStep({ uploadedFiles, setUploadedFiles }: FilesStepProps) {
  const handleManuscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, manuscript: file }));
    }
  };

  const handleCoverLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, coverLetter: file }));
    }
  };

  const handleSupplementaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => ({
      ...prev,
      supplementary: [...prev.supplementary, ...files],
    }));
  };

  const removeSupplementaryFile = (index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      supplementary: prev.supplementary.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your manuscript and any supplementary materials
        </p>
      </div>

      {/* Manuscript File */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="manuscript">
                Manuscript File <span className="text-error-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your main manuscript (PDF, DOC, DOCX, or LaTeX)
              </p>
            </div>
            {uploadedFiles.manuscript && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles((prev) => ({ ...prev, manuscript: undefined }))}
                className="text-error-500"
              >
                Remove
              </Button>
            )}
          </div>

          {uploadedFiles.manuscript ? (
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
                <p className="text-sm font-medium">{uploadedFiles.manuscript.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFiles.manuscript.size)}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-success"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="manuscript"
                accept=".pdf,.doc,.docx,.tex"
                onChange={handleManuscriptUpload}
                className="hidden"
              />
              <label htmlFor="manuscript">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, DOCX, or TEX (max 50MB)
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Cover Letter (Optional) */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Optionally upload a cover letter
              </p>
            </div>
            {uploadedFiles.coverLetter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles((prev) => ({ ...prev, coverLetter: undefined }))}
                className="text-error-500"
              >
                Remove
              </Button>
            )}
          </div>

          {uploadedFiles.coverLetter ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-surface">
              <div className="flex-1">
                <p className="text-sm font-medium">{uploadedFiles.coverLetter.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFiles.coverLetter.size)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="coverLetter"
                accept=".pdf,.doc,.docx"
                onChange={handleCoverLetterUpload}
                className="hidden"
              />
              <label htmlFor="coverLetter">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span>Upload Cover Letter</span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Supplementary Files */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="supplementary">Supplementary Files (Optional)</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Upload additional files such as datasets, images, or videos
            </p>
          </div>

          {uploadedFiles.supplementary.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.supplementary.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-surface">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupplementaryFile(index)}
                    className="text-error-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              id="supplementary"
              multiple
              onChange={handleSupplementaryUpload}
              className="hidden"
            />
            <label htmlFor="supplementary">
              <Button type="button" variant="outline" className="w-full" asChild>
                <span>+ Add Supplementary File</span>
              </Button>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}

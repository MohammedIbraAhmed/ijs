import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ManuscriptSubmissionFormData } from '@/lib/validators/manuscript';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReviewersStepProps {
  form: UseFormReturn<ManuscriptSubmissionFormData>;
}

export function ReviewersStep({ form }: ReviewersStepProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'suggestedReviewers',
  });

  const addReviewer = () => {
    if (fields.length < 5) {
      append({
        name: '',
        email: '',
        affiliation: '',
        expertise: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Suggested Reviewers (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You may suggest up to 5 reviewers who are qualified to review your manuscript. The
          editor will consider your suggestions but is not obligated to use them.
        </p>
      </div>

      {fields.length === 0 && (
        <div className="p-6 border-2 border-dashed rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto mb-3 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <p className="text-sm text-muted-foreground mb-4">
            No reviewers added yet. This is optional.
          </p>
          <Button type="button" onClick={addReviewer} variant="outline">
            Add Suggested Reviewer
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline">Reviewer {index + 1}</Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-error-500 hover:text-error-600"
              >
                Remove
              </Button>
            </div>

            <div className="grid gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor={`suggestedReviewers.${index}.name`}>
                  Full Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id={`suggestedReviewers.${index}.name`}
                  {...register(`suggestedReviewers.${index}.name`)}
                  placeholder="Dr. John Doe"
                />
                {errors.suggestedReviewers?.[index]?.name && (
                  <p className="text-sm text-error-500">
                    {errors.suggestedReviewers[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor={`suggestedReviewers.${index}.email`}>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  id={`suggestedReviewers.${index}.email`}
                  type="email"
                  {...register(`suggestedReviewers.${index}.email`)}
                  placeholder="john.doe@university.edu"
                />
                {errors.suggestedReviewers?.[index]?.email && (
                  <p className="text-sm text-error-500">
                    {errors.suggestedReviewers[index]?.email?.message}
                  </p>
                )}
              </div>

              {/* Affiliation */}
              <div className="space-y-2">
                <Label htmlFor={`suggestedReviewers.${index}.affiliation`}>
                  Affiliation (Optional)
                </Label>
                <Input
                  id={`suggestedReviewers.${index}.affiliation`}
                  {...register(`suggestedReviewers.${index}.affiliation`)}
                  placeholder="University Name"
                />
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <Label htmlFor={`suggestedReviewers.${index}.expertise`}>
                  Expertise (Optional)
                </Label>
                <Input
                  id={`suggestedReviewers.${index}.expertise`}
                  {...register(`suggestedReviewers.${index}.expertise`)}
                  placeholder="Research area or expertise"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {fields.length > 0 && fields.length < 5 && (
        <Button type="button" variant="outline" onClick={addReviewer} className="w-full">
          + Add Another Reviewer ({5 - fields.length} remaining)
        </Button>
      )}
    </div>
  );
}

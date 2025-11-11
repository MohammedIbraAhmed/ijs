import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ManuscriptSubmissionFormData } from '@/lib/validators/manuscript';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AuthorsStepProps {
  form: UseFormReturn<ManuscriptSubmissionFormData>;
}

export function AuthorsStep({ form }: AuthorsStepProps) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  const addAuthor = () => {
    append({
      name: '',
      email: '',
      affiliation: '',
      corresponding: false,
    });
  };

  const toggleCorresponding = (index: number) => {
    const authors = watch('authors');
    authors.forEach((_, i) => {
      setValue(`authors.${i}.corresponding`, i === index);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Manuscript Authors</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add all authors who contributed to this manuscript. At least one must be marked as the
          corresponding author.
        </p>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Author {index + 1}</Badge>
                {watch(`authors.${index}.corresponding`) && (
                  <Badge className="bg-primary-600">Corresponding</Badge>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-error-500 hover:text-error-600"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor={`authors.${index}.name`}>
                  Full Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id={`authors.${index}.name`}
                  {...register(`authors.${index}.name`)}
                  placeholder="Dr. Jane Smith"
                />
                {errors.authors?.[index]?.name && (
                  <p className="text-sm text-error-500">
                    {errors.authors[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor={`authors.${index}.email`}>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  id={`authors.${index}.email`}
                  type="email"
                  {...register(`authors.${index}.email`)}
                  placeholder="jane.smith@university.edu"
                />
                {errors.authors?.[index]?.email && (
                  <p className="text-sm text-error-500">
                    {errors.authors[index]?.email?.message}
                  </p>
                )}
              </div>

              {/* Affiliation */}
              <div className="space-y-2">
                <Label htmlFor={`authors.${index}.affiliation`}>Affiliation (Optional)</Label>
                <Input
                  id={`authors.${index}.affiliation`}
                  {...register(`authors.${index}.affiliation`)}
                  placeholder="University Name, Department"
                />
              </div>

              {/* Corresponding Author */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`authors.${index}.corresponding`}
                  checked={watch(`authors.${index}.corresponding`)}
                  onChange={() => toggleCorresponding(index)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`authors.${index}.corresponding`} className="cursor-pointer">
                  Set as corresponding author
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Author Button */}
      <Button type="button" variant="outline" onClick={addAuthor} className="w-full">
        + Add Another Author
      </Button>

      {errors.authors && typeof errors.authors.message === 'string' && (
        <p className="text-sm text-error-500">{errors.authors.message}</p>
      )}
    </div>
  );
}

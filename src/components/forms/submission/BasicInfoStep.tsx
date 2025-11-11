import { UseFormReturn } from 'react-hook-form';
import { ManuscriptSubmissionFormData } from '@/lib/validators/manuscript';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BasicInfoStepProps {
  form: UseFormReturn<ManuscriptSubmissionFormData>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const manuscriptType = watch('manuscriptType');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Manuscript Title <span className="text-error-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter the title of your manuscript"
          className="h-11"
        />
        {errors.title && (
          <p className="text-sm text-error-500">{errors.title.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          A clear and concise title that reflects your research
        </p>
      </div>

      {/* Manuscript Type */}
      <div className="space-y-2">
        <Label htmlFor="manuscriptType">
          Manuscript Type <span className="text-error-500">*</span>
        </Label>
        <Select
          value={manuscriptType}
          onValueChange={(value) =>
            setValue('manuscriptType', value as any, { shouldValidate: true })
          }
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select manuscript type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="research">Research Article</SelectItem>
            <SelectItem value="review">Review Article</SelectItem>
            <SelectItem value="case-study">Case Study</SelectItem>
            <SelectItem value="short-communication">Short Communication</SelectItem>
          </SelectContent>
        </Select>
        {errors.manuscriptType && (
          <p className="text-sm text-error-500">{errors.manuscriptType.message}</p>
        )}
      </div>

      {/* Category (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Input
          id="category"
          {...register('category')}
          placeholder="e.g., Biology, Chemistry, Physics"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Specify the scientific field or category
        </p>
      </div>

      {/* Abstract */}
      <div className="space-y-2">
        <Label htmlFor="abstract">
          Abstract <span className="text-error-500">*</span>
        </Label>
        <Textarea
          id="abstract"
          {...register('abstract')}
          placeholder="Provide a concise summary of your research (50-3000 characters)"
          className="min-h-[200px] resize-y"
        />
        {errors.abstract && (
          <p className="text-sm text-error-500">{errors.abstract.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {watch('abstract')?.length || 0} / 3000 characters
        </p>
      </div>
    </div>
  );
}

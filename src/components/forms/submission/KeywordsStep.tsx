import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ManuscriptSubmissionFormData } from '@/lib/validators/manuscript';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface KeywordsStepProps {
  form: UseFormReturn<ManuscriptSubmissionFormData>;
}

export function KeywordsStep({ form }: KeywordsStepProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const [keywordInput, setKeywordInput] = useState('');
  const keywords = watch('keywords') || [];

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 10) {
      setValue('keywords', [...keywords, trimmed], { shouldValidate: true });
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setValue(
      'keywords',
      keywords.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Keywords</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add relevant keywords to help readers discover your manuscript (minimum 1, maximum 10)
        </p>
      </div>

      {/* Keyword Input */}
      <div className="space-y-2">
        <Label htmlFor="keyword-input">
          Add Keywords <span className="text-error-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="keyword-input"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a keyword and press Enter"
            className="h-11"
            disabled={keywords.length >= 10}
          />
          <Button
            type="button"
            onClick={addKeyword}
            disabled={!keywordInput.trim() || keywords.length >= 10}
          >
            Add
          </Button>
        </div>
        {errors.keywords && (
          <p className="text-sm text-error-500">{errors.keywords.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {keywords.length} / 10 keywords added
        </p>
      </div>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          <Label>Added Keywords</Label>
          <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-surface">
            {keywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="hover:text-error-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="p-4 border rounded-lg bg-primary-50 dark:bg-primary-900/20">
        <h4 className="font-medium text-sm mb-2">Tips for choosing keywords:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use specific terms that describe your research</li>
          <li>Include terms that researchers might search for</li>
          <li>Avoid very general or very specific terms</li>
          <li>Use standard terminology from your field</li>
        </ul>
      </div>
    </div>
  );
}

import { ImageIcon, X } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export const ImageUpload = ({
  value,
  onChange,
  onRemove,
}: ImageUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Branch Photo</Label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <div className="h-32 w-32 rounded-lg border overflow-hidden">
              <img
                src={URL.createObjectURL(value)}
                alt="Branch preview"
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="h-32 w-32 rounded-lg border-2 border-dashed flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload a photo of the branch. PNG, JPG up to 5MB.
          </p>
        </div>
      </div>
    </div>
  );
};

import { X } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

import { ImageUpload } from './ImageUpload';

interface EditBranchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingBranch: Record<string, unknown>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  isMain: boolean;
  setIsMain: (value: boolean) => void;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  existingPhotoUrl: string | null;
}

export const EditBranchDialog = ({
  isOpen,
  onOpenChange,
  editingBranch: _editingBranch,
  onSubmit,
  name,
  setName,
  address,
  setAddress,
  isMain,
  setIsMain,
  photoFile,
  setPhotoFile,
  existingPhotoUrl,
}: EditBranchDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMain"
              checked={isMain}
              onCheckedChange={(checked) => setIsMain(checked as boolean)}
            />
            <Label htmlFor="isMain">Main Branch</Label>
          </div>
          <div className="space-y-2">
            {photoFile ? (
              <ImageUpload
                value={photoFile}
                onChange={setPhotoFile}
                onRemove={() => setPhotoFile(null)}
              />
            ) : existingPhotoUrl ? (
              <div className="space-y-2">
                <Label>Current Photo</Label>
                <div className="relative">
                  <div className="h-32 w-32 rounded-lg border overflow-hidden">
                    <img
                      src={existingPhotoUrl}
                      alt="Branch"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => setPhotoFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoFile(file);
                  }}
                  className="mt-2"
                />
              </div>
            ) : (
              <ImageUpload
                value={photoFile}
                onChange={setPhotoFile}
                onRemove={() => setPhotoFile(null)}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

interface Branch {
  id: string;
  name: string;
  address?: string;
  is_main: boolean;
  google_maps_url?: string;
}

interface EditBranchFormProps {
  editingBranch: Branch;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  isMain: boolean;
  setIsMain: (value: boolean) => void;
  onCancel: () => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (value: string) => void;
}

export const EditBranchForm = ({
  editingBranch,
  onSubmit,
  name,
  setName,
  address,
  setAddress,
  isMain,
  setIsMain,
  onCancel,
  googleMapsUrl,
  setGoogleMapsUrl,
}: EditBranchFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4 px-1">
        <div className="space-y-2">
          <Label htmlFor={`edit-branch-name-${editingBranch.id}`}>
            Branch Name
          </Label>
          <Input
            id={`edit-branch-name-${editingBranch.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edit-branch-address-${editingBranch.id}`}>
            Address
          </Label>
          <Input
            id={`edit-branch-address-${editingBranch.id}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edit-branch-googleMapsUrl-${editingBranch.id}`}>
            Google Maps URL
          </Label>
          <Input
            id={`edit-branch-googleMapsUrl-${editingBranch.id}`}
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="Enter Google Maps URL"
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4 px-1 pt-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`edit-branch-isMain-${editingBranch.id}`}
            checked={isMain}
            onCheckedChange={(checked) => setIsMain(checked as boolean)}
            aria-labelledby={`edit-branch-isMain-label-${editingBranch.id}`}
          />
          <Label
            htmlFor={`edit-branch-isMain-${editingBranch.id}`}
            id={`edit-branch-isMain-label-${editingBranch.id}`}
            className="cursor-pointer"
          >
            Main Branch
          </Label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 px-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2">
          Update Branch
        </Button>
      </div>
    </form>
  );
};

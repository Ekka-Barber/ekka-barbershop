import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

import { supabase } from '@shared/lib/supabase/client';
import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import { useToast } from '@shared/ui/components/use-toast';

interface CreateBranchFormProps {
  onSuccess: () => void;
}

export const CreateBranchForm = ({ onSuccess }: CreateBranchFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const resetFormFields = () => {
    setName('');
    setAddress('');
    setIsMain(false);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { error } = await supabase.from('branches').insert({
        name,
        address,
        is_main: isMain,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });

      resetFormFields();
      onSuccess();
      setIsExpanded(false);
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormFields();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full sm:w-auto flex items-center justify-center mb-4"
        variant="outline"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Branch
      </Button>
    );
  }

  return (
    <div className="p-4 border rounded-md mb-6">
      <h4 className="text-md font-semibold mb-4">Add New Branch</h4>
      <form onSubmit={handleCreateBranch} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name</Label>
            <Input
              id="name"
              placeholder="Enter branch name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2 pt-0 sm:pt-8">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMain"
                checked={isMain}
                onCheckedChange={(checked) => setIsMain(checked as boolean)}
                aria-labelledby="isMain-label"
              />
              <Label
                htmlFor="isMain"
                id="isMain-label"
                className="cursor-pointer"
              >
                Main Branch
              </Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? 'Creating...' : 'Add Branch'}
          </Button>
        </div>
      </form>
    </div>
  );
};

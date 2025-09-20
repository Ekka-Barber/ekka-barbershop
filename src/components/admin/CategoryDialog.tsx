
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSupabaseClient } from '@/services/supabaseService';
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useBranchAssignment } from '@/hooks/useBranchAssignment';
import { useServiceAssignment } from '@/hooks/useServiceAssignment';

interface CategoryDialogProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
  categoryId?: string;
  categoryEnName?: string;
  categoryArName?: string;
}

export const CategoryDialog = ({ trigger, onSuccess, categoryId, categoryEnName, categoryArName }: CategoryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nameEn, setNameEn] = useState(categoryEnName || '');
  const [nameAr, setNameAr] = useState(categoryArName || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!categoryId;

  // Use custom hooks for branch and service assignment
  const { branches, selectedBranchIds, handleToggleBranch } = useBranchAssignment({
    categoryId,
    isOpen
  });
  const { assignServicesToBranches, isAssigningServices } = useServiceAssignment();

  const handleSubmit = async () => {
    if (!nameEn || !nameAr) return;

    setIsLoading(true);
    try {
      const supabase = await getSupabaseClient();

      let categoryResult;

      if (isEditing) {
        // Update existing category
        const { data, error } = await supabase
          .from('service_categories')
          .update({
            name_en: nameEn,
            name_ar: nameAr
          })
          .eq('id', categoryId)
          .select()
          .single();

        if (error) throw error;
        categoryResult = data;
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('service_categories')
          .insert({
            name_en: nameEn,
            name_ar: nameAr,
            display_order: 0 // Default order
          })
          .select()
          .single();

        if (error) throw error;
        categoryResult = data;
      }
      
      // Handle branch assignments
      if (categoryResult) {
        // First, get existing assignments to compare
        const { data: existingAssignments, error: fetchError } = await supabase
          .from('branch_categories')
          .select('branch_id')
          .eq('category_id', categoryResult.id);
          
        if (fetchError) throw fetchError;
        
        const existingBranchIds = existingAssignments?.map(a => a.branch_id) || [];
        
        // Branches to add
        const branchesToAdd = selectedBranchIds.filter(id => !existingBranchIds.includes(id));
        
        // Branches to remove
        const branchesToRemove = existingBranchIds.filter(id => !selectedBranchIds.includes(id));
        
        // Add new assignments
        if (branchesToAdd.length > 0) {
          const assignments = branchesToAdd.map(branchId => ({
            branch_id: branchId,
            category_id: categoryResult.id,
            branch_name: branches.find(b => b.id === branchId)?.name,
            category_name_en: nameEn,
            category_name_ar: nameAr
          }));

          const { error: insertError } = await supabase
            .from('branch_categories')
            .insert(assignments);

          if (insertError) throw insertError;

          // Automatically assign all services under this category to the selected branches
          await assignServicesToBranches({
            categoryResult,
            selectedBranchIds: branchesToAdd,
            branches
          });
        }
        
        // Remove assignments
        if (branchesToRemove.length > 0) {
          for (const branchId of branchesToRemove) {
            const { error: deleteError } = await supabase
              .from('branch_categories')
              .delete()
              .eq('branch_id', branchId)
              .eq('category_id', categoryResult.id);
              
            if (deleteError) throw deleteError;
          }
        }
      }
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
      
      toast({
        title: isEditing ? "Category Updated" : "Category Added",
        description: `${nameEn} has been ${isEditing ? 'updated' : 'added'} successfully.`,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the category details and branch assignments.' 
              : 'Enter category details and select which branches it belongs to.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name-en">English Name</Label>
            <Input 
              id="name-en" 
              value={nameEn} 
              onChange={(e) => setNameEn(e.target.value)} 
              placeholder="Category name in English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name-ar">Arabic Name</Label>
            <Input 
              id="name-ar" 
              value={nameAr} 
              onChange={(e) => setNameAr(e.target.value)} 
              placeholder="Category name in Arabic"
              dir="rtl"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label>Branch Assignment</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {branches.map(branch => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`branch-${branch.id}`} 
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={(checked) => handleToggleBranch(branch.id, checked === true)}
                  />
                  <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal">
                    {branch.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(isLoading || isAssigningServices) || !nameEn || !nameAr}
          >
            {(isLoading || isAssigningServices) ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

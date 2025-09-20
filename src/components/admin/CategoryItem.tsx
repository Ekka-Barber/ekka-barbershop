import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Service } from '@/types/service';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ServiceItem from './ServiceItem';
import { ServiceDialog } from './ServiceDialog';
import { CategoryDialog } from './CategoryDialog';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CategoryBranchAssignment } from './category-management/CategoryBranchAssignment';
import { Draggable } from '@hello-pangea/dnd';

interface CategoryItemProps {
  category: Category;
  services?: Service[];
  onDelete: (categoryId: string) => void;
  onExpandedChange?: (categoryId: string, isExpanded: boolean) => void;
  isExpanded?: boolean;
  index: number; // Added the index prop for drag and drop functionality
}

// Optimize the component with React.memo to prevent unnecessary re-renders
const CategoryItem = React.memo(({ category, services = [], onDelete, onExpandedChange, isExpanded, index }: CategoryItemProps) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [branchAssignments, setBranchAssignments] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);

  useEffect(() => {
    setExpanded(isExpanded || false);
  }, [isExpanded]);

  const handleExpandedChange = useCallback((newExpanded: boolean) => {
    setExpanded(newExpanded);
    onExpandedChange?.(category.id, newExpanded);
  }, [category.id, onExpandedChange]);

  const handleDelete = useCallback(() => {
    onDelete(category.id);
    setIsDeleteDialogOpen(false);
  }, [category.id, onDelete]);

  // Optimize branch assignments fetching
  useEffect(() => {
    const fetchBranchAssignments = async () => {
      if (!category.id) return;
      
      setIsFetchingBranches(true);
      try {
        const { data, error } = await supabase
          .from('branch_categories')
          .select('branch_id, branch_name')
          .eq('category_id', category.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBranchAssignments(data.map(a => a.branch_name));
        } else {
          setBranchAssignments([]);
        }
      } catch (error) {
        console.error('Error fetching branch assignments:', error);
      } finally {
        setIsFetchingBranches(false);
      }
    };
    
    fetchBranchAssignments();
  }, [category.id]);

  // Memoize branch label creation to prevent unnecessary calculations
  const branchLabel = useMemo(() => {
    if (isFetchingBranches) return 'Loading...';
    if (branchAssignments.length === 0) return 'Not assigned';
    if (branchAssignments.length === 1) return branchAssignments[0];
    return 'Multiple branches';
  }, [branchAssignments, isFetchingBranches]);

  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="border-none shadow-none">
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">{category.name_en}</h3>
                  <p className="text-sm text-muted-foreground">{category.name_ar}</p>
                
                  {/* Add branch assignment badge */}
                  <div className="mt-1">
                    <Badge 
                      variant={branchAssignments.length > 0 ? "default" : "outline"} 
                      className="mt-1"
                    >
                      {branchLabel}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CategoryDialog
                    categoryId={category.id}
                    categoryEnName={category.name_en}
                    categoryArName={category.name_ar}
                    onSuccess={() => {
                      toast({
                        title: "Category Updated",
                        description: "Category has been updated successfully.",
                      });
                    }}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All data associated with this category will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <ServiceDialog
                    categories={[category]}
                    onSuccess={() => {
                      toast({
                        title: "Service Added",
                        description: "Service has been added successfully.",
                      });
                    }}
                    trigger={
                      <Button variant="outline" size="sm">
                        Add Service <Plus className="w-4 h-4 ml-2" />
                      </Button>
                    }
                  />
                </div>
              </div>
              
              <Collapsible open={expanded} onOpenChange={handleExpandedChange}>
                <CollapsibleTrigger className="w-full">
                  Services ({services?.length || 0})
                </CollapsibleTrigger>
                
                {isExpanded && (
                  <CollapsibleContent className="space-y-2">
                    <div className="mt-4">
                      <CategoryBranchAssignment categoryId={category.id} categoryName={category.name_en} />
                    </div>
                    
                    {services && services.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {services.map(service => (
                          <ServiceItem
                            key={service.id}
                            service={service}
                            onEdit={() => {}}
                            onDelete={() => {}}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No services in this category
                      </div>
                    )}
                  </CollapsibleContent>
                )}
              </Collapsible>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this category?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
});

export default CategoryItem;

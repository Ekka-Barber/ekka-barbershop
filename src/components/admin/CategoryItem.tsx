
import React, { useState, useEffect } from 'react';
import { Category, Service } from '@/types/service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const CategoryItem = ({ category, services = [], onDelete, onExpandedChange, isExpanded, index }: CategoryItemProps) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(isExpanded || false);
  }, [isExpanded]);

  const handleExpandedChange = (newExpanded: boolean) => {
    setExpanded(newExpanded);
    onExpandedChange?.(category.id, newExpanded);
  };

  const handleDelete = () => {
    onDelete(category.id);
    setIsDeleteDialogOpen(false);
  };

  // Add branch assignment display
  const [branchAssignments, setBranchAssignments] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);

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

  const [showConfirmation, setShowConfirmation] = useState(false);

  let branchLabel = 'Not assigned';
  if (branchAssignments.length === 1) {
    branchLabel = branchAssignments[0];
  } else if (branchAssignments.length > 1) {
    branchLabel = 'Multiple branches';
  }

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
                    <Badge variant={branchAssignments.length > 0 ? "default" : "outline"} className="mt-1">
                      {isFetchingBranches ? 'Loading...' : branchLabel}
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
};

export default CategoryItem;

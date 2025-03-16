
import React, { useState, useEffect } from 'react';
import { Service } from '@/types/service';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ServiceDialog } from './ServiceDialog';
import { formatPrice } from '@/utils/formatters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceBranchAssignment } from './service-management/ServiceBranchAssignment';
import { supabase } from "@/integrations/supabase/client";
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
} from "@/components/ui/alert-dialog";

interface ServiceItemProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const ServiceItem = ({ service, onEdit, onDelete }: ServiceItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Add branch assignment display
  const [branchAssignments, setBranchAssignments] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  
  useEffect(() => {
    const fetchBranchAssignments = async () => {
      if (!service.id) return;
      
      setIsFetchingBranches(true);
      try {
        const { data, error } = await supabase
          .from('branch_services')
          .select('branch_id, branch_name')
          .eq('service_id', service.id);
          
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
  }, [service.id]);
  
  let branchLabel = 'Not assigned';
  if (branchAssignments.length === 1) {
    branchLabel = branchAssignments[0];
  } else if (branchAssignments.length > 1) {
    branchLabel = 'Multiple branches';
  }
  
  return (
    <div className="bg-card border rounded-md">
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{service.name_en}</h3>
              
              {/* Add branch badge */}
              <Badge variant={branchAssignments.length > 0 ? "default" : "outline"} className="ml-2">
                {isFetchingBranches ? 'Loading...' : branchLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{service.name_ar}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {formatPrice(service.price)}
            </p>
            <Separator orientation="vertical" className="h-4" />
            <p className="text-sm text-muted-foreground">
              {service.duration} minutes
            </p>
            
            <div className="flex items-center ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                {isDetailsOpen ? (
                  <>
                    Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <ServiceDialog
                categories={[]}
                editService={service}
                onSuccess={() => {
                  toast({
                    title: "Service Updated",
                    description: "Service has been updated successfully.",
                  });
                }}
                trigger={
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
              
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {isDetailsOpen && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description (EN)</h4>
              <p className="text-sm text-muted-foreground">
                {service.description_en || 'No description'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description (AR)</h4>
              <p className="text-sm text-muted-foreground">
                {service.description_ar || 'No description'}
              </p>
            </div>
            
            {/* Add branch assignment component */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Branch Assignment</h4>
              <ServiceBranchAssignment serviceId={service.id} serviceName={service.name_en} />
            </div>
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {service.name_en}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDelete(service);
              setIsDeleteDialogOpen(false);
              toast({
                title: "Service Deleted",
                description: "Service has been deleted successfully.",
              });
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceItem;

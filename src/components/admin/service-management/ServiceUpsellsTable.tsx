
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Service } from '@/types/service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServiceUpsell {
  id: string;
  main_service_id: string;
  upsell_service_id: string;
  discount_percentage: number;
  main_service?: Service;
  upsell_service?: Service;
}

// Group upsells by main service
interface GroupedUpsells {
  [mainServiceId: string]: {
    mainService: Service;
    upsells: ServiceUpsell[];
  }
}

export const ServiceUpsellsTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
  const [selectedUpsell, setSelectedUpsell] = useState<ServiceUpsell | null>(null);
  const [newUpsell, setNewUpsell] = useState<{
    main_service_id: string;
    upsell_service_id: string;
    discount_percentage: number;
  }>({
    main_service_id: '',
    upsell_service_id: '',
    discount_percentage: 10
  });

  // Fetch all services for dropdowns
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name_en');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  // Fetch all upsells with related service details
  const { data: upsells = [], isLoading: isLoadingUpsells } = useQuery({
    queryKey: ['service-upsells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_upsells')
        .select(`
          id,
          main_service_id,
          upsell_service_id,
          discount_percentage,
          main_service:services!service_upsells_main_service_id_fkey (
            id, name_en, price
          ),
          upsell_service:services!service_upsells_upsell_service_id_fkey (
            id, name_en, price
          )
        `)
        .order('main_service_id');
      
      if (error) throw error;
      return data as ServiceUpsell[];
    }
  });

  // Group upsells by main service
  const groupedUpsells: GroupedUpsells = upsells.reduce((acc: GroupedUpsells, upsell) => {
    if (!upsell.main_service) return acc;
    
    if (!acc[upsell.main_service_id]) {
      acc[upsell.main_service_id] = {
        mainService: upsell.main_service,
        upsells: []
      };
    }
    
    acc[upsell.main_service_id].upsells.push(upsell);
    return acc;
  }, {});

  // Add new upsell
  const addUpsellMutation = useMutation({
    mutationFn: async (upsell: {
      main_service_id: string;
      upsell_service_id: string;
      discount_percentage: number;
    }) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('service_upsells')
        .insert(upsell)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      setIsUpsellModalOpen(false);
      resetUpsellForm();
      toast({
        title: "Success",
        description: "Upsell relationship added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add upsell relationship",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  // Update existing upsell
  const updateUpsellMutation = useMutation({
    mutationFn: async (upsell: {
      id: string;
      main_service_id: string;
      upsell_service_id: string;
      discount_percentage: number;
    }) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('service_upsells')
        .update({
          main_service_id: upsell.main_service_id,
          upsell_service_id: upsell.upsell_service_id,
          discount_percentage: upsell.discount_percentage
        })
        .eq('id', upsell.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      setIsUpsellModalOpen(false);
      setSelectedUpsell(null);
      resetUpsellForm();
      toast({
        title: "Success",
        description: "Upsell relationship updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update upsell relationship",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  // Delete upsell
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      toast({
        title: "Success",
        description: "Upsell relationship deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete upsell relationship",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const handleEditUpsell = (upsell: ServiceUpsell) => {
    setSelectedUpsell(upsell);
    setNewUpsell({
      main_service_id: upsell.main_service_id,
      upsell_service_id: upsell.upsell_service_id,
      discount_percentage: upsell.discount_percentage
    });
    setIsUpsellModalOpen(true);
  };

  const handleAddUpsell = () => {
    setSelectedUpsell(null);
    resetUpsellForm();
    setIsUpsellModalOpen(true);
  };

  const handleDeleteUpsell = (id: string) => {
    if (confirm("Are you sure you want to delete this upsell relationship?")) {
      deleteUpsellMutation.mutate(id);
    }
  };

  const handleSubmitUpsell = () => {
    // Validation
    if (!newUpsell.main_service_id || !newUpsell.upsell_service_id) {
      toast({
        title: "Error",
        description: "Please select both main service and upsell service",
        variant: "destructive"
      });
      return;
    }

    if (newUpsell.main_service_id === newUpsell.upsell_service_id) {
      toast({
        title: "Error",
        description: "Main service and upsell service cannot be the same",
        variant: "destructive"
      });
      return;
    }

    if (selectedUpsell) {
      // Update existing
      updateUpsellMutation.mutate({
        id: selectedUpsell.id,
        ...newUpsell
      });
    } else {
      // Add new
      addUpsellMutation.mutate(newUpsell);
    }
  };

  const resetUpsellForm = () => {
    if (services.length > 0) {
      setNewUpsell({
        main_service_id: services[0].id,
        upsell_service_id: '',
        discount_percentage: 10
      });
    } else {
      setNewUpsell({
        main_service_id: '',
        upsell_service_id: '',
        discount_percentage: 10
      });
    }
  };

  // Initialize form with first service when services are loaded
  useEffect(() => {
    if (services.length > 0 && !newUpsell.main_service_id) {
      resetUpsellForm();
    }
  }, [services]);

  // Filter eligible upsell services (can't upsell itself)
  const getEligibleUpsellServices = () => {
    return services.filter(s => s.id !== newUpsell.main_service_id);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Service Upsells</h2>
        <Button onClick={handleAddUpsell} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Upsell
        </Button>
      </div>
      <Separator className="mb-6" />

      {isLoadingUpsells ? (
        <div className="text-center py-8">Loading upsells...</div>
      ) : Object.keys(groupedUpsells).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No upsell relationships found. Add some using the button above.
        </div>
      ) : (
        <div className="rounded-md border">
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedUpsells).map(([mainServiceId, { mainService, upsells }]) => (
              <AccordionItem key={mainServiceId} value={mainServiceId} className="border-b">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex-1 text-left font-semibold">
                    {mainService.name_en}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Upsell Service</TableHead>
                        <TableHead className="w-[120px] text-center">Discount %</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upsells.map((upsell) => (
                        <TableRow key={upsell.id}>
                          <TableCell>
                            {upsell.upsell_service?.name_en || 'Unknown service'}
                          </TableCell>
                          <TableCell className="text-center">
                            {upsell.discount_percentage}%
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUpsell(upsell)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUpsell(upsell.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Add/Edit Upsell Dialog */}
      <Dialog open={isUpsellModalOpen} onOpenChange={setIsUpsellModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUpsell ? 'Edit Upsell Relationship' : 'Add Upsell Relationship'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="main-service" className="text-sm font-medium">Main Service</label>
              <Select
                value={newUpsell.main_service_id}
                onValueChange={(value) => setNewUpsell({...newUpsell, main_service_id: value})}
              >
                <SelectTrigger id="main-service">
                  <SelectValue placeholder="Select main service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="upsell-service" className="text-sm font-medium">Upsell Service</label>
              <Select
                value={newUpsell.upsell_service_id}
                onValueChange={(value) => setNewUpsell({...newUpsell, upsell_service_id: value})}
              >
                <SelectTrigger id="upsell-service">
                  <SelectValue placeholder="Select upsell service" />
                </SelectTrigger>
                <SelectContent>
                  {getEligibleUpsellServices().map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="discount" className="text-sm font-medium">Discount Percentage</label>
              <div className="flex items-center gap-2">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newUpsell.discount_percentage}
                  onChange={(e) => setNewUpsell({
                    ...newUpsell, 
                    discount_percentage: parseInt(e.target.value) || 0
                  })}
                />
                <span className="text-sm">%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUpsellModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitUpsell}
              disabled={!newUpsell.main_service_id || !newUpsell.upsell_service_id}
            >
              {selectedUpsell ? 'Update' : 'Add'} Upsell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

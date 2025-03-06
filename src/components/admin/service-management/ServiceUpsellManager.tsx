
import { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, Link, Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Service } from '@/types/service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ServiceWithUpsells extends Service {
  upsells?: Array<{
    id: string;
    main_service_id: string;
    upsell_service_id: string;
    discount_percentage: number;
    upsell: Service;
  }>;
}

interface UpsellItem {
  upsellServiceId: string;
  discountPercentage: number;
}

export const ServiceUpsellManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [editingUpsell, setEditingUpsell] = useState<{
    id: string;
    discount: number;
  } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUpsell, setNewUpsell] = useState<{
    mainServiceId: string;
    upsellItems: UpsellItem[];
  }>({
    mainServiceId: '',
    upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
  });

  // Fetch all services for dropdown selection
  const { data: allServices } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name_en');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  // Fetch services with their upsells
  const { data: servicesWithUpsells, isLoading } = useQuery({
    queryKey: ['services-with-upsells'],
    queryFn: async () => {
      // First get all services that have upsells configured
      const { data: upsellRelations, error: upsellError } = await supabase
        .from('service_upsells')
        .select(`
          id,
          main_service_id,
          upsell_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (*)
        `);

      if (upsellError) throw upsellError;

      // Get unique main service IDs
      const mainServiceIds = [...new Set(upsellRelations.map(rel => rel.main_service_id))];

      // Fetch details of the main services
      const { data: mainServices, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('id', mainServiceIds);

      if (servicesError) throw servicesError;

      // Group upsells by main service
      const servicesMap: Record<string, ServiceWithUpsells> = {};
      
      mainServices.forEach(service => {
        servicesMap[service.id] = {
          ...service,
          upsells: []
        };
      });

      upsellRelations.forEach(relation => {
        if (servicesMap[relation.main_service_id]) {
          servicesMap[relation.main_service_id].upsells!.push({
            ...relation,
            upsell: relation.upsell as Service
          });
        }
      });

      return Object.values(servicesMap);
    }
  });

  // Add a new upsell item to the form
  const addUpsellItem = () => {
    setNewUpsell({
      ...newUpsell,
      upsellItems: [...newUpsell.upsellItems, { upsellServiceId: '', discountPercentage: 10 }]
    });
  };

  // Remove an upsell item from the form
  const removeUpsellItem = (index: number) => {
    const updatedItems = [...newUpsell.upsellItems];
    updatedItems.splice(index, 1);
    setNewUpsell({
      ...newUpsell,
      upsellItems: updatedItems
    });
  };

  // Update an upsell item in the form
  const updateUpsellItem = (index: number, field: keyof UpsellItem, value: string | number) => {
    const updatedItems = [...newUpsell.upsellItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setNewUpsell({
      ...newUpsell,
      upsellItems: updatedItems
    });
  };

  // Mutation to add new upsell relationships
  const addUpsellMutation = useMutation({
    mutationFn: async (data: typeof newUpsell) => {
      const { mainServiceId, upsellItems } = data;
      
      if (!mainServiceId || upsellItems.some(item => !item.upsellServiceId)) {
        throw new Error('Please select both main service and all upsell services');
      }
      
      // Check for duplicate upsell services in the form
      const uniqueUpsellIds = new Set(upsellItems.map(item => item.upsellServiceId));
      if (uniqueUpsellIds.size !== upsellItems.length) {
        throw new Error('Each upsell service must be unique');
      }

      // Create array to store promises for batch insert
      const insertPromises = [];

      for (const item of upsellItems) {
        // Check if relation already exists
        const { data: existing, error: checkError } = await supabase
          .from('service_upsells')
          .select('id')
          .eq('main_service_id', mainServiceId)
          .eq('upsell_service_id', item.upsellServiceId)
          .maybeSingle();

        if (checkError) throw checkError;
        
        if (existing) {
          throw new Error(`An upsell relationship already exists for this service: ${item.upsellServiceId}`);
        }

        // Add insert operation to array
        insertPromises.push(
          supabase
            .from('service_upsells')
            .insert({
              main_service_id: mainServiceId,
              upsell_service_id: item.upsellServiceId,
              discount_percentage: item.discountPercentage,
            })
        );
      }

      // Execute all inserts
      const results = await Promise.all(insertPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Error adding relationship: ${errors[0].error?.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
      toast({
        title: "Success",
        description: "New upsell relationships added successfully.",
      });
      setIsAddDialogOpen(false);
      setNewUpsell({
        mainServiceId: '',
        upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to update upsell discount
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, discount }: { id: string; discount: number }) => {
      const { error } = await supabase
        .from('service_upsells')
        .update({ discount_percentage: discount })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
      toast({
        title: "Discount updated",
        description: "The upsell discount has been updated successfully."
      });
      setEditingUpsell(null);
    }
  });

  // Mutation to delete upsell relationship
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
      toast({
        title: "Upsell removed",
        description: "The upsell relationship has been removed successfully."
      });
    }
  });

  const handleAddUpsell = () => {
    if (!newUpsell.mainServiceId) {
      toast({
        title: "Missing information",
        description: "Please select a main service",
        variant: "destructive"
      });
      return;
    }

    if (newUpsell.upsellItems.some(item => !item.upsellServiceId)) {
      toast({
        title: "Missing information",
        description: "Please select all upsell services",
        variant: "destructive"
      });
      return;
    }

    // Check for services referring to themselves
    if (newUpsell.upsellItems.some(item => item.upsellServiceId === newUpsell.mainServiceId)) {
      toast({
        title: "Invalid selection",
        description: "Main service and upsell service cannot be the same",
        variant: "destructive"
      });
      return;
    }

    // Check for invalid discount values
    if (newUpsell.upsellItems.some(item => 
      item.discountPercentage < 0 || item.discountPercentage > 100
    )) {
      toast({
        title: "Invalid discount",
        description: "Discount must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    addUpsellMutation.mutate(newUpsell);
  };

  const handleUpdateDiscount = (id: string, discount: number) => {
    if (discount < 0 || discount > 100) {
      toast({
        title: "Invalid discount",
        description: "Discount must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    updateUpsellMutation.mutate({ id, discount });
  };

  const handleDeleteUpsell = (id: string) => {
    deleteUpsellMutation.mutate(id);
  };

  // Get available services for a specific upsell item (excluding already selected ones)
  const getAvailableServices = (index: number) => {
    if (!allServices) return [];

    const selectedIds = new Set(
      newUpsell.upsellItems
        .filter((_, i) => i !== index)
        .map(item => item.upsellServiceId)
    );

    // Also exclude the main service
    if (newUpsell.mainServiceId) {
      selectedIds.add(newUpsell.mainServiceId);
    }

    return allServices.filter(service => !selectedIds.has(service.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Add Upsell Relation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Upsell Relationship</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Service</label>
                <Select
                  value={newUpsell.mainServiceId}
                  onValueChange={(value) => setNewUpsell({...newUpsell, mainServiceId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main service" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {allServices?.map(service => (
                      <SelectItem key={`main-${service.id}`} value={service.id}>
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Upsell Services</label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2"
                    onClick={addUpsellItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another
                  </Button>
                </div>
                
                {newUpsell.upsellItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={item.upsellServiceId}
                        onValueChange={(value) => updateUpsellItem(index, 'upsellServiceId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select upsell service" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {getAvailableServices(index).map(service => (
                            <SelectItem key={`upsell-${service.id}-${index}`} value={service.id}>
                              {language === 'ar' ? service.name_ar : service.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-16">
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPercentage}
                          onChange={(e) => updateUpsellItem(
                            index, 
                            'discountPercentage', 
                            parseInt(e.target.value) || 0
                          )}
                          className="h-10"
                        />
                        <span className="ml-1">%</span>
                      </div>
                    </div>
                    
                    {newUpsell.upsellItems.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeUpsellItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUpsell} disabled={addUpsellMutation.isPending}>
                {addUpsellMutation.isPending ? 'Adding...' : 'Add Relationship'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-muted-foreground">Manage upsell relationships between services. Only services with upsells are shown.</p>
      
      {!servicesWithUpsells || servicesWithUpsells.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p>No services with upsell relationships found.</p>
            <p className="text-sm mt-2">Use the "Add Upsell Relation" button to create new upsell relationships.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {servicesWithUpsells.map(service => (
            <AccordionItem key={service.id} value={service.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <h3 className="font-medium text-left">
                      {language === 'ar' ? service.name_ar : service.name_en}
                    </h3>
                    <p className="text-sm text-muted-foreground text-left">
                      {service.upsells?.length} upsell{service.upsells?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Upsell Service</TableHead>
                      <TableHead className="w-32 text-center">Discount</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {service.upsells?.map(upsell => (
                      <TableRow key={upsell.id}>
                        <TableCell>
                          {language === 'ar' ? upsell.upsell.name_ar : upsell.upsell.name_en}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingUpsell?.id === upsell.id ? (
                            <Input 
                              type="number" 
                              min={0}
                              max={100}
                              value={editingUpsell.discount}
                              onChange={(e) => setEditingUpsell({ 
                                ...editingUpsell, 
                                discount: parseInt(e.target.value) || 0 
                              })}
                              className="w-20 h-8 mx-auto text-center"
                            />
                          ) : (
                            <span>{upsell.discount_percentage}%</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingUpsell?.id === upsell.id ? (
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingUpsell(null)}
                                className="h-8 px-2"
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleUpdateDiscount(upsell.id, editingUpsell.discount)}
                                className="h-8 px-2"
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingUpsell({ id: upsell.id, discount: upsell.discount_percentage })}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUpsell(upsell.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

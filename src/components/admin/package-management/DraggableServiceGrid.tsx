
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Service } from '@/types/service';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { useLanguage } from "@/contexts/LanguageContext";
import { GripVertical } from "lucide-react";

interface DraggableServiceGridProps {
  services: Service[] | undefined;
  isLoading: boolean;
  isBaseService: (serviceId: string) => boolean;
  isServiceEnabled: (serviceId: string) => boolean;
  onToggleService: (serviceId: string) => void;
  onReorderServices: (sourceIndex: number, destinationIndex: number) => void;
}

export const DraggableServiceGrid = ({ 
  services, 
  isLoading,
  isBaseService,
  isServiceEnabled,
  onToggleService,
  onReorderServices
}: DraggableServiceGridProps) => {
  const { language } = useLanguage();
  
  // Group services into enabled and disabled
  const enabledServices = services?.filter(service => isServiceEnabled(service.id) && !isBaseService(service.id)) || [];
  const disabledServices = services?.filter(service => !isServiceEnabled(service.id) && !isBaseService(service.id)) || [];
  const baseServices = services?.filter(service => isBaseService(service.id)) || [];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4">
              <div className="animate-pulse flex flex-col">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-10"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!services || services.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-600">No Services Available</h3>
        <p className="text-gray-500 mt-1">
          There are no services to display at this time.
        </p>
      </div>
    );
  }

  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    // Don't reorder if items are the same
    if (result.destination.index === result.source.index) {
      return;
    }
    
    onReorderServices(result.source.index, result.destination.index);
  };

  const renderServiceCard = (service: Service, isDraggable: boolean, index?: number) => {
    const isBase = isBaseService(service.id);
    const isEnabled = isServiceEnabled(service.id);
    
    return (
      <Card 
        className={`w-full transition-all ${
          isBase ? 'opacity-50 cursor-not-allowed' : 
          isEnabled ? 'border-primary/30 bg-primary/5' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isDraggable && (
                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical size={16} />
                </div>
              )}
              <h3 className="font-medium truncate flex-1">
                {language === 'ar' ? service.name_ar : service.name_en}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <PriceDisplay 
                price={service.price}
                language={language}
              />
              <Switch
                checked={isEnabled}
                onCheckedChange={() => !isBase && onToggleService(service.id)}
                disabled={isBase}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Base services (always on top) */}
      {baseServices.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Base Service</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {baseServices.map(service => renderServiceCard(service, false))}
          </div>
        </div>
      )}
      
      {/* Draggable enabled services */}
      {enabledServices.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Enabled Services <span className="text-xs">(drag to reorder)</span>
          </h4>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="enabledServices">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {enabledServices.map((service, index) => (
                    <Draggable key={service.id} draggableId={service.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderServiceCard(service, true, index)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
      
      {/* Disabled services (always at bottom) */}
      {disabledServices.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Disabled Services</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {disabledServices.map(service => renderServiceCard(service, false))}
          </div>
        </div>
      )}
    </div>
  );
};

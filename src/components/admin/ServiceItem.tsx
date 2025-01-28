import { GripVertical } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { Service } from '@/types/service';

type ServiceItemProps = {
  service: Service;
  index: number;
};

export const ServiceItem = ({ service, index }: ServiceItemProps) => {
  return (
    <Draggable
      key={service.id}
      draggableId={service.id}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">{service.name_en}</p>
              <p className="text-xs text-gray-500">{service.name_ar}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {service.duration} mins • ${service.price}
          </div>
        </div>
      )}
    </Draggable>
  );
};
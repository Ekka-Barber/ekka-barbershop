
import { Dispatch, SetStateAction } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ServiceWithUpsells } from './types';

interface UpsellServiceTableProps {
  upsells: ServiceWithUpsells['upsells'];
  editingUpsell: { id: string; discount: number } | null;
  setEditingUpsell: Dispatch<SetStateAction<{ id: string; discount: number } | null>>;
  onUpdateDiscount: (id: string, discount: number) => void;
  onDeleteUpsell: (id: string) => void;
}

export const UpsellServiceTable = ({
  upsells = [],
  editingUpsell,
  setEditingUpsell,
  onUpdateDiscount,
  onDeleteUpsell
}: UpsellServiceTableProps) => {
  const { language } = useLanguage();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Upsell Service</TableHead>
          <TableHead className="w-32 text-center">Discount</TableHead>
          <TableHead className="w-32 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {upsells.map(upsell => (
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
                    onClick={() => onUpdateDiscount(upsell.id, editingUpsell.discount)}
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
                    onClick={() => onDeleteUpsell(upsell.id)}
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
  );
};

import { ArrowRightLeft, Edit2, Plus, Save, Trash2, X, Loader2 } from 'lucide-react';

import type { DynamicField, EmployeeWithBranch } from '@shared/types/business';
import type { EmployeeBonus } from '@shared/types/domains';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/components/accordion';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { formatPrice } from '@shared/utils/currency';

import type { BonusEditingRecord } from './types';

interface EmployeeBonusCardProps {
  employee: EmployeeWithBranch;
  employeeBonuses: EmployeeBonus[];
  pendingBonuses: DynamicField[];
  totalBonuses: number;
  editingBonus: BonusEditingRecord | null;
  isEditing: boolean;
  isDeletingId: string | null;
  isSavingEmployee: string | null;
  onAddBonus: (employeeName: string) => void;
  onRemoveBonus: (employeeName: string, index: number) => void;
  onBonusDescriptionChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onBonusAmountChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onBonusDateChange: (
    employeeName: string,
    index: number,
    value: string
  ) => void;
  onStartEditing: (bonus: EmployeeBonus) => void;
  onCancelEditing: () => void;
  onUpdateEditingBonus: (updates: Partial<BonusEditingRecord>) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSaveBonuses: (employeeName: string, bonuses: DynamicField[]) => void;
  onTransfer?: (bonus: EmployeeBonus) => void;
}

export const EmployeeBonusCard: React.FC<EmployeeBonusCardProps> = ({
  employee,
  employeeBonuses,
  pendingBonuses,
  totalBonuses,
  editingBonus,
  isEditing,
  isDeletingId,
  isSavingEmployee,
  onAddBonus,
  onRemoveBonus,
  onBonusDescriptionChange,
  onBonusAmountChange,
  onBonusDateChange,
  onStartEditing,
  onCancelEditing,
  onUpdateEditingBonus,
  onEdit,
  onDelete,
  onSaveBonuses,
  onTransfer,
}) => {
  return (
    <Card key={employee.id} className="h-fit">
      <CardHeader className="bg-green-50 pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              {employee.name.charAt(0).toUpperCase()}
              {employee.name.split(' ').length > 1
                ? employee.name.split(' ')[1].charAt(0).toUpperCase()
                : ''}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">
                {employee.branches?.name || 'Unknown Branch'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-700">
              {formatPrice(totalBonuses)}
            </div>
            <div className="text-xs text-gray-500">Total Bonuses</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Existing Bonuses */}
          {employeeBonuses.length > 0 && (
            <AccordionItem value="existing">
              <AccordionTrigger className="text-sm font-medium">
                🎉 Existing Bonuses ({employeeBonuses.length})
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                {employeeBonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    {editingBonus?.id === bonus.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingBonus.description}
                          onChange={(e) =>
                            onUpdateEditingBonus({
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          value={editingBonus.amount}
                          onChange={(e) =>
                            onUpdateEditingBonus({
                              amount: e.target.value,
                            })
                          }
                          placeholder="Amount"
                          className="text-sm"
                        />
                        <Input
                          type="date"
                          value={editingBonus.date || ''}
                          onChange={(e) =>
                            onUpdateEditingBonus({
                              date: e.target.value,
                            })
                          }
                          className="text-sm w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={onEdit}
                            className="flex-1"
                            disabled={isEditing}
                          >
                            {isEditing ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onCancelEditing}
                            className="flex-1"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {bonus.description}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bonus.date}
                          </div>
                          <div className="font-bold text-green-600">
                            {formatPrice(bonus.amount)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onStartEditing(bonus)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          {onTransfer && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onTransfer(bonus)}
                              className="text-blue-600 hover:text-blue-700"
                              disabled={isDeletingId === bonus.id}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(bonus.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={isDeletingId === bonus.id}
                          >
                            {isDeletingId === bonus.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Add New Bonuses */}
          <AccordionItem value="new">
            <AccordionTrigger className="text-sm font-medium">
              ➕ Add New Bonuses ({pendingBonuses.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {pendingBonuses.map((field, index) => (
                <div
                  key={field.id || `${employee.id}-bonus-${index}`}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Description"
                      value={field.description}
                      onChange={(e) =>
                        onBonusDescriptionChange(
                          employee.name,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBonus(employee.name, index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="Amount (SAR)"
                    value={field.amount}
                    onChange={(e) =>
                      onBonusAmountChange(employee.name, index, e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    value={field.date || ''}
                    onChange={(e) =>
                      onBonusDateChange(employee.name, index, e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddBonus(employee.name)}
                  className="flex-1"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Bonus
                </Button>

                {pendingBonuses.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => onSaveBonuses(employee.name, pendingBonuses)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSavingEmployee === employee.name}
                  >
                    {isSavingEmployee === employee.name ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Save All
                      </>
                    )}
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

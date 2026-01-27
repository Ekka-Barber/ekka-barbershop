import { useState } from 'react';

import type { EmployeeBonus } from '@shared/types/domains';

import type { BonusEditingRecord } from './types';

export const useBonusEditing = () => {
  const [editingBonus, setEditingBonus] = useState<BonusEditingRecord | null>(
    null
  );

  const startEditing = (bonus: EmployeeBonus) => {
    setEditingBonus({
      id: bonus.id,
      description: bonus.description,
      amount: bonus.amount.toString(),
      date: bonus.date,
    });
  };

  const cancelEditing = () => {
    setEditingBonus(null);
  };

  const updateEditingBonus = (updates: Partial<BonusEditingRecord>) => {
    if (editingBonus) {
      setEditingBonus({ ...editingBonus, ...updates });
    }
  };

  return {
    editingBonus,
    startEditing,
    cancelEditing,
    updateEditingBonus,
    setEditingBonus,
  };
};

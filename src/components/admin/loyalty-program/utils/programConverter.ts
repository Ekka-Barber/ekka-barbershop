
import { LoyaltyProgram } from "../types";

export const convertDatabaseToProgram = (data: any): LoyaltyProgram => {
  return {
    id: data.id,
    points_required: typeof data.points_required === 'string' 
      ? JSON.parse(data.points_required)
      : data.points_required,
    tiers: typeof data.tiers === 'string'
      ? JSON.parse(data.tiers)
      : data.tiers,
    happy_hour: typeof data.happy_hour === 'string'
      ? JSON.parse(data.happy_hour)
      : data.happy_hour,
    description_template: data.description_template,
    is_active: data.is_active,
    updated_at: data.updated_at
  };
};

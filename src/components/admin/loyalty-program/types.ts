
export interface LoyaltyProgram {
  id: string;
  points_required: Record<string, number>;
  tiers: Record<string, { points: number; discount: number }>;
  happy_hour: Record<string, string[]>;
  description_template: string | null;
  is_active: boolean;
  updated_at: string;
}

export const defaultProgram: Partial<LoyaltyProgram> = {
  points_required: {},
  tiers: {
    bronze: { points: 0, discount: 0 },
    silver: { points: 1000, discount: 5 },
    gold: { points: 5000, discount: 10 }
  },
  happy_hour: {},
  description_template: "Earn {points} points and get {reward} SAR cashback!",
  is_active: true
};

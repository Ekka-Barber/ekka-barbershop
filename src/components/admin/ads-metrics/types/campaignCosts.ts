
export interface CampaignCost {
  id: string;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  start_date: string;
  end_date: string;
  daily_budget: number;
  total_spent: number;
  currency: string;
}

export interface CampaignCostFormData {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  start_date: Date;
  end_date: Date;
  daily_budget: number;
  currency: string;
}


import { supabase } from "@/integrations/supabase/client";
import { CampaignCost, CampaignCostFormData } from "../types/campaignCosts";

export const fetchCampaignCosts = async () => {
  const { data, error } = await supabase
    .from('campaign_costs')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as CampaignCost[];
};

export const fetchCampaignCostsByDateRange = async (fromDate: Date, toDate: Date) => {
  const { data, error } = await supabase
    .from('campaign_costs')
    .select('*')
    .or(`start_date.lte.${toDate.toISOString()},end_date.gte.${fromDate.toISOString()}`);

  if (error) throw error;
  return data as CampaignCost[];
};

export const addCampaignCost = async (formData: CampaignCostFormData) => {
  const { data, error } = await supabase
    .from('campaign_costs')
    .insert({
      campaign_id: formData.campaign_id,
      campaign_name: formData.campaign_name,
      platform: formData.platform,
      start_date: formData.start_date.toISOString().split('T')[0],
      end_date: formData.end_date.toISOString().split('T')[0],
      daily_budget: formData.daily_budget,
      total_spent: calculateTotalSpent(formData.start_date, formData.end_date, formData.daily_budget),
      currency: formData.currency || 'SAR'
    })
    .select()
    .single();

  if (error) throw error;
  return data as CampaignCost;
};

export const updateCampaignCost = async (id: string, formData: CampaignCostFormData) => {
  const { data, error } = await supabase
    .from('campaign_costs')
    .update({
      campaign_id: formData.campaign_id,
      campaign_name: formData.campaign_name,
      platform: formData.platform,
      start_date: formData.start_date.toISOString().split('T')[0],
      end_date: formData.end_date.toISOString().split('T')[0],
      daily_budget: formData.daily_budget,
      total_spent: calculateTotalSpent(formData.start_date, formData.end_date, formData.daily_budget),
      currency: formData.currency || 'SAR',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CampaignCost;
};

export const deleteCampaignCost = async (id: string) => {
  const { error } = await supabase
    .from('campaign_costs')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Helper to calculate total spent based on daily budget and date range
const calculateTotalSpent = (startDate: Date, endDate: Date, dailyBudget: number) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMilliseconds = 1000 * 60 * 60 * 24;
  
  // Include both start and end dates in the calculation
  const days = Math.round((end.getTime() - start.getTime()) / dayMilliseconds) + 1;
  return days * dailyBudget;
};

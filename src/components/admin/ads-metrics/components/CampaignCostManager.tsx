
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchCampaignCosts,
  addCampaignCost,
  updateCampaignCost,
  deleteCampaignCost,
} from "../services/campaignCostService";
import { CampaignCost, CampaignCostFormData } from "../types/campaignCosts";

const PLATFORMS = ["TikTok", "Instagram", "Google", "Facebook", "Other"];

export const CampaignCostManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignCostFormData>({
    campaign_id: "",
    campaign_name: "",
    platform: "TikTok",
    start_date: new Date(),
    end_date: new Date(),
    daily_budget: 0,
    currency: "SAR",
  });

  // Query campaign costs
  const { data: campaignCosts, isLoading } = useQuery({
    queryKey: ["campaign-costs"],
    queryFn: fetchCampaignCosts,
  });

  // Mutation for adding campaign cost
  const addMutation = useMutation({
    mutationFn: addCampaignCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-costs"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-summary"] });
      toast({
        title: "Success!",
        description: "Campaign cost added successfully",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add campaign cost: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating campaign cost
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignCostFormData }) =>
      updateCampaignCost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-costs"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-summary"] });
      toast({
        title: "Success!",
        description: "Campaign cost updated successfully",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update campaign cost: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting campaign cost
  const deleteMutation = useMutation({
    mutationFn: deleteCampaignCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-costs"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-summary"] });
      toast({
        title: "Success!",
        description: "Campaign cost deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete campaign cost: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (
      !formData.campaign_name ||
      !formData.platform ||
      !formData.start_date ||
      !formData.end_date ||
      formData.daily_budget <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editId) {
      updateMutation.mutate({ id: editId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
    setIsOpen(false);
  };

  const handleEdit = (cost: CampaignCost) => {
    setEditId(cost.id);
    setFormData({
      campaign_id: cost.campaign_id,
      campaign_name: cost.campaign_name,
      platform: cost.platform,
      start_date: new Date(cost.start_date),
      end_date: new Date(cost.end_date),
      daily_budget: cost.daily_budget,
      currency: cost.currency,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign cost?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      campaign_id: "",
      campaign_name: "",
      platform: "TikTok",
      start_date: new Date(),
      end_date: new Date(),
      daily_budget: 0,
      currency: "SAR",
    });
    setEditId(null);
  };

  const handleChange = (field: keyof CampaignCostFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Campaign Costs</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={() => {
              resetForm();
              setIsOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Campaign Cost
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Campaign Cost" : "Add Campaign Cost"}
              </DialogTitle>
              <DialogDescription>
                Enter the details for the campaign cost.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign_id">Campaign ID</Label>
                <Input
                  id="campaign_id"
                  value={formData.campaign_id}
                  onChange={(e) => handleChange("campaign_id", e.target.value)}
                  placeholder="e.g., TK-2023-Q4"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign_name">Campaign Name*</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => handleChange("campaign_name", e.target.value)}
                  placeholder="Summer Promotion"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform*</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleChange("platform", value)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date*</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(formData.start_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) =>
                          date && handleChange("start_date", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>End Date*</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? (
                          format(formData.end_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => date && handleChange("end_date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="daily_budget">Daily Budget (SAR)*</Label>
                <Input
                  id="daily_budget"
                  type="number"
                  value={formData.daily_budget.toString()}
                  onChange={(e) =>
                    handleChange("daily_budget", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSave}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading campaign costs...</div>
      ) : campaignCosts?.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No campaign costs recorded yet
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Daily Budget
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {campaignCosts?.map((cost) => (
                <tr key={cost.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium">{cost.campaign_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cost.campaign_id}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {cost.platform}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {format(new Date(cost.start_date), "MMM d, yyyy")} -{" "}
                    {format(new Date(cost.end_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {cost.daily_budget} {cost.currency}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {cost.total_spent} {cost.currency}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(cost)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cost.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

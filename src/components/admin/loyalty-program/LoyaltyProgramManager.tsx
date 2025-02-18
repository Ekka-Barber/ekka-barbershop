
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PointsRewardsSection from "./sections/PointsRewardsSection";
import LoyaltyTiersSection from "./sections/LoyaltyTiersSection";
import HappyHourSection from "./sections/HappyHourSection";
import DescriptionSection from "./sections/DescriptionSection";

interface LoyaltyProgram {
  id: string;
  points_required: Record<string, number>;
  tiers: Record<string, { points: number; discount: number }>;
  happy_hour: Record<string, string[]>;
  description_template: string | null;
  is_active: boolean;
  updated_at: string;
}

const defaultProgram: Partial<LoyaltyProgram> = {
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

export default function LoyaltyProgramManager() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_program")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (data) {
        setProgram(data);
      } else {
        // Create default program if none exists
        const { data: newProgram, error: createError } = await supabase
          .from("loyalty_program")
          .insert([defaultProgram])
          .select()
          .single();

        if (createError) throw createError;
        setProgram(newProgram);
      }
    } catch (error) {
      console.error("Error fetching loyalty program:", error);
      toast({
        title: "Error",
        description: "Failed to load loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!program?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("loyalty_program")
        .update({
          points_required: program.points_required,
          tiers: program.tiers,
          happy_hour: program.happy_hour,
          description_template: program.description_template,
          updated_at: new Date().toISOString(),
        })
        .eq("id", program.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Loyalty program settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving loyalty program:", error);
      toast({
        title: "Error",
        description: "Failed to save loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loyalty Program</h2>
          {program?.updated_at && (
            <p className="text-sm text-muted-foreground">
              Last updated: {format(new Date(program.updated_at), "PPpp")}
            </p>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="min-w-[100px]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Points & Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <PointsRewardsSection
              value={program?.points_required || {}}
              onChange={(points_required) => 
                setProgram(prev => prev ? { ...prev, points_required } : null)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <LoyaltyTiersSection
              value={program?.tiers || {}}
              onChange={(tiers) => 
                setProgram(prev => prev ? { ...prev, tiers } : null)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Happy Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <HappyHourSection
              value={program?.happy_hour || {}}
              onChange={(happy_hour) => 
                setProgram(prev => prev ? { ...prev, happy_hour } : null)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description Template</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionSection
              value={program?.description_template || ""}
              points={program?.points_required || {}}
              onChange={(description_template) => 
                setProgram(prev => prev ? { ...prev, description_template } : null)
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

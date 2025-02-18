
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PointsRewardsSection from "./sections/PointsRewardsSection";
import LoyaltyTiersSection from "./sections/LoyaltyTiersSection";
import HappyHourSection from "./sections/HappyHourSection";
import DescriptionSection from "./sections/DescriptionSection";
import { useLoyaltyProgram } from "./hooks/useLoyaltyProgram";

export default function LoyaltyProgramManager() {
  const { program, setProgram, loading, saving, handleSave } = useLoyaltyProgram();

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

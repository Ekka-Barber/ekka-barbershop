
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface PointsRewardsSectionProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

export default function PointsRewardsSection({ value, onChange }: PointsRewardsSectionProps) {
  const [newPoints, setNewPoints] = useState("");
  const [newReward, setNewReward] = useState("");

  const handleAdd = () => {
    if (!newPoints || !newReward) return;
    
    const points = parseInt(newPoints);
    const reward = parseFloat(newReward);
    
    if (isNaN(points) || isNaN(reward)) return;
    
    onChange({ ...value, [points]: reward });
    setNewPoints("");
    setNewReward("");
  };

  const handleRemove = (points: string) => {
    const newValue = { ...value };
    delete newValue[points];
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Object.entries(value)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([points, reward]) => (
            <div key={points} className="flex items-center gap-2">
              <Input
                type="number"
                value={points}
                onChange={(e) => {
                  const newValue = { ...value };
                  delete newValue[points];
                  newValue[e.target.value] = reward;
                  onChange(newValue);
                }}
                className="w-24"
              />
              <span className="text-sm">points =</span>
              <Input
                type="number"
                value={reward}
                onChange={(e) => {
                  onChange({ ...value, [points]: parseFloat(e.target.value) || 0 });
                }}
                className="w-24"
              />
              <span className="text-sm">SAR</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(points)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={newPoints}
          onChange={(e) => setNewPoints(e.target.value)}
          placeholder="Points"
          className="w-24"
        />
        <span className="text-sm">points =</span>
        <Input
          type="number"
          value={newReward}
          onChange={(e) => setNewReward(e.target.value)}
          placeholder="Reward"
          className="w-24"
        />
        <span className="text-sm">SAR</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdd}
          disabled={!newPoints || !newReward}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

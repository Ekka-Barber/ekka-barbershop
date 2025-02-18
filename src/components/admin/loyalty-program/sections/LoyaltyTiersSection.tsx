
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";

interface Tier {
  points: number;
  discount: number;
}

interface LoyaltyTiersSectionProps {
  value: Record<string, Tier>;
  onChange: (value: Record<string, Tier>) => void;
}

export default function LoyaltyTiersSection({ value, onChange }: LoyaltyTiersSectionProps) {
  const [newTierName, setNewTierName] = useState("");
  const [newTierPoints, setNewTierPoints] = useState("");
  const [newTierDiscount, setNewTierDiscount] = useState("");

  const handleAdd = () => {
    if (!newTierName || !newTierPoints || !newTierDiscount) return;
    
    const points = parseInt(newTierPoints);
    const discount = parseFloat(newTierDiscount);
    
    if (isNaN(points) || isNaN(discount)) return;
    
    onChange({ 
      ...value, 
      [newTierName.toLowerCase()]: { points, discount } 
    });
    
    setNewTierName("");
    setNewTierPoints("");
    setNewTierDiscount("");
  };

  const handleRemove = (tierName: string) => {
    const newValue = { ...value };
    delete newValue[tierName];
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Object.entries(value)
          .sort(([,a], [,b]) => a.points - b.points)
          .map(([tierName, tier]) => (
            <div key={tierName} className="flex items-center gap-2">
              <Input
                value={tierName}
                onChange={(e) => {
                  const newValue = { ...value };
                  delete newValue[tierName];
                  newValue[e.target.value.toLowerCase()] = tier;
                  onChange(newValue);
                }}
                className="w-32"
                placeholder="Tier name"
              />
              <Input
                type="number"
                value={tier.points}
                onChange={(e) => {
                  onChange({
                    ...value,
                    [tierName]: { ...tier, points: parseInt(e.target.value) || 0 }
                  });
                }}
                className="w-24"
                placeholder="Points"
              />
              <Input
                type="number"
                value={tier.discount}
                onChange={(e) => {
                  onChange({
                    ...value,
                    [tierName]: { ...tier, discount: parseFloat(e.target.value) || 0 }
                  });
                }}
                className="w-24"
                placeholder="Discount %"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(tierName)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newTierName}
          onChange={(e) => setNewTierName(e.target.value)}
          className="w-32"
          placeholder="Tier name"
        />
        <Input
          type="number"
          value={newTierPoints}
          onChange={(e) => setNewTierPoints(e.target.value)}
          className="w-24"
          placeholder="Points"
        />
        <Input
          type="number"
          value={newTierDiscount}
          onChange={(e) => setNewTierDiscount(e.target.value)}
          className="w-24"
          placeholder="Discount %"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdd}
          disabled={!newTierName || !newTierPoints || !newTierDiscount}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

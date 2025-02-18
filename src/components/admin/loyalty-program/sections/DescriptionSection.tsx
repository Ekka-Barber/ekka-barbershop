
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionSectionProps {
  value: string;
  points: Record<string, number>;
  onChange: (value: string) => void;
}

export default function DescriptionSection({ 
  value, 
  points, 
  onChange 
}: DescriptionSectionProps) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    // Generate preview with actual values
    let previewText = value;
    const firstPoints = Object.entries(points)[0];
    
    if (firstPoints) {
      previewText = previewText
        .replace("{points}", firstPoints[0])
        .replace("{reward}", firstPoints[1].toString());
    }
    
    setPreview(previewText);
  }, [value, points]);

  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter description template with {points} and {reward} placeholders"
        className="min-h-[100px]"
      />
      
      <div className="p-4 bg-muted rounded-md">
        <h4 className="text-sm font-medium mb-2">Preview:</h4>
        <p className="text-sm text-muted-foreground">{preview}</p>
      </div>
    </div>
  );
}

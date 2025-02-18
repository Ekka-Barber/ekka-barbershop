
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { DeviceType } from "@/types/heatmap";
import { Dispatch, SetStateAction } from "react";

interface HeatmapControlsProps {
  selectedDevice: DeviceType;
  setSelectedDevice: (device: DeviceType) => void;
  opacity: number;
  setOpacity: Dispatch<SetStateAction<number>>;
  zoomLevel: number;
  setZoomLevel: Dispatch<SetStateAction<number>>;
  showUI: boolean;
  setShowUI: Dispatch<SetStateAction<boolean>>;
}

export const HeatmapControls = ({
  selectedDevice,
  setSelectedDevice,
  opacity,
  setOpacity,
  zoomLevel,
  setZoomLevel,
  showUI,
  setShowUI
}: HeatmapControlsProps) => {
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.1));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(2, prev + 0.1));
  };

  const toggleUI = () => {
    setShowUI(prev => !prev);
  };

  return (
    <div className={`mb-6 space-y-4 ${showUI ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
      <div className="flex gap-4">
        <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Opacity</label>
          <Slider
            value={[opacity * 100]}
            onValueChange={(value) => setOpacity(value[0] / 100)}
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleUI}
          >
            {showUI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};


import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface FileUploadSectionProps {
  branches: any[];
  isAllBranches: boolean;
  setIsAllBranches: (value: boolean) => void;
  selectedBranch: string | null;
  setSelectedBranch: (value: string | null) => void;
  selectedStartDate: Date | undefined;
  setSelectedStartDate: (date: Date | undefined) => void;
  selectedStartTime: string;
  setSelectedStartTime: (time: string) => void;
  selectedEndDate: Date | undefined;
  setSelectedEndDate: (date: Date | undefined) => void;
  selectedEndTime: string;
  setSelectedEndTime: (time: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, category: string) => void;
  uploading: boolean;
}

export const FileUploadSection = ({
  branches,
  isAllBranches,
  setIsAllBranches,
  selectedBranch,
  setSelectedBranch,
  selectedStartDate,
  setSelectedStartDate,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndDate,
  setSelectedEndDate,
  selectedEndTime,
  setSelectedEndTime,
  handleFileUpload,
  uploading
}: FileUploadSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Menu</h2>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => handleFileUpload(e, 'menu')}
          className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          disabled={uploading}
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Offers</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="allBranches" 
              checked={isAllBranches}
              onCheckedChange={(checked) => {
                setIsAllBranches(checked === true);
                if (checked) setSelectedBranch(null);
              }}
            />
            <Label htmlFor="allBranches">Available at all branches</Label>
          </div>
          
          {!isAllBranches && (
            <Select value={selectedBranch || ''} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex flex-col space-y-2">
            <Label>Start Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${!selectedStartDate && "text-muted-foreground"}`}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, "PPP") : <span>Pick a start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={selectedStartTime}
                onChange={(e) => setSelectedStartTime(e.target.value)}
                className="w-[120px]"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>End Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${!selectedEndDate && "text-muted-foreground"}`}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedEndDate ? format(selectedEndDate, "PPP") : <span>Pick an end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                className="w-[120px]"
              />
            </div>
          </div>
          
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => handleFileUpload(e, 'offers')}
            className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            disabled={uploading || (!isAllBranches && !selectedBranch)}
          />
        </div>
      </div>
    </div>
  );
};

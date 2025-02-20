
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
import { FilePreview } from '@/types/admin';

interface FileUploadSectionProps {
  branches: any[];
  isAllBranches: boolean;
  setIsAllBranches: (value: boolean) => void;
  selectedBranch: string | null;
  setSelectedBranch: (value: string | null) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, category: string) => void;
  uploading: boolean;
  filePreview: FilePreview | null;
}

export const FileUploadSection = ({
  branches,
  isAllBranches,
  setIsAllBranches,
  selectedBranch,
  setSelectedBranch,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleFileUpload,
  uploading,
  filePreview
}: FileUploadSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Menu</h2>
        {filePreview && filePreview.type === 'menu' && (
          <div className="mb-4">
            {filePreview.fileType === 'image' ? (
              <img src={filePreview.url} alt="Preview" className="max-h-40 rounded-lg" />
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">PDF file selected</p>
              </div>
            )}
          </div>
        )}
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
          {filePreview && filePreview.type === 'offers' && (
            <div className="mb-4">
              {filePreview.fileType === 'image' ? (
                <img src={filePreview.url} alt="Preview" className="max-h-40 rounded-lg" />
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">PDF file selected</p>
                </div>
              )}
            </div>
          )}
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
            <Label>End Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
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

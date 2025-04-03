import { useState, useRef } from 'react';
import { FileUploadSectionProps } from '@/types/file-management';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrashIcon, FileIcon, MenuIcon, TagIcon, CalendarIcon, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

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
  filePreview,
}: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<'menu' | 'offers'>('menu');

  const handleCategoryChange = (category: 'menu' | 'offers') => {
    setSelectedCategory(category);
    // Clear the selected file when the category changes
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event, selectedCategory);
  };

  const clearFilePreview = () => {
    // Clear the selected file in the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear date and time
    setSelectedDate(undefined);
    setSelectedTime("23:59");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TagIcon className="h-4 w-4" />
          <Label htmlFor="category">Category</Label>
        </div>
        <Select onValueChange={(value) => handleCategoryChange(value as 'menu' | 'offers')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menu">Menu</SelectItem>
            <SelectItem value="offers">Offers</SelectItem>
          </SelectContent>
        </Select>

        {selectedCategory === 'offers' && (
          <>
            <div className="flex items-center space-x-2">
              <MenuIcon className="h-4 w-4" />
              <Label htmlFor="branch">Branch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="all-branches" checked={isAllBranches} onCheckedChange={setIsAllBranches} />
              <Label htmlFor="all-branches">All Branches</Label>
            </div>
            {!isAllBranches && (
              <Select onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <Label htmlFor="expiration">Expiration Date</Label>
            </div>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <Label htmlFor="expiration-time">Expiration Time</Label>
              </div>
              <Select
                value={selectedTime || "23:59"}
                onValueChange={setSelectedTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(24)].map((_, hour) => (
                    <>
                      <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                      <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                        {hour.toString().padStart(2, '0')}:30
                      </SelectItem>
                    </>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <FileIcon className="h-4 w-4" />
          <Label htmlFor="file">File</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            id="file"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            asChild
            disabled={uploading}
          >
            <label htmlFor="file" className="cursor-pointer">
              {uploading ? "Uploading..." : "Select File"}
            </label>
          </Button>
          {filePreview && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearFilePreview}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* File Preview Section */}
      {filePreview && (
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium">File Preview</h3>
          {filePreview.fileType === 'image' ? (
            <img src={filePreview.url} alt="File Preview" className="mt-2 rounded-md max-h-40 object-contain" />
          ) : filePreview.fileType === 'pdf' ? (
            <div className="mt-2 flex items-center justify-between">
              <p>PDF File - Preview not available</p>
              <a href={filePreview.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                <ExternalLink className="h-4 w-4 mr-2 inline-block align-middle" />
                Open PDF
              </a>
            </div>
          ) : (
            <p className="mt-2">Unsupported file type</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            File Name: {filePreview.name}
          </p>
        </div>
      )}
    </div>
  );
};

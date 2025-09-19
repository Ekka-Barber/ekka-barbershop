
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Upload, FileText, X, AlertCircle } from "lucide-react";
import { format, isSameDay } from "date-fns"; // Import isSameDay from date-fns
import type { FilePreview } from '@/types/admin';
import type { Branch } from '@/types/branch';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadSectionProps {
  branches: Branch[];
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
  const menuInputRef = useRef<HTMLInputElement>(null);
  const offersInputRef = useRef<HTMLInputElement>(null);
  
  // Track drag states
  const [menuDragActive, setMenuDragActive] = useState(false);
  const [offersDragActive, setOffersDragActive] = useState(false);
  
  // File validation states
  const [fileError, setFileError] = useState<string | null>(null);

  // Handle file drop events
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, category: 'menu' | 'offers') => {
    e.preventDefault();
    e.stopPropagation();
    
    setMenuDragActive(false);
    setOffersDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      const validTypes = ['.pdf', '.png', '.jpg', '.jpeg', 'application/pdf', 'image/png', 'image/jpeg'];
      if (!validTypes.some(type => file.type.includes(type.replace('.', '')) || file.name.endsWith(type))) {
        setFileError('Invalid file type. Please upload PDF, PNG, or JPG files.');
        return;
      }
      
      // Create synthetic event
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(syntheticEvent, category);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, category: 'menu' | 'offers') => {
    e.preventDefault();
    e.stopPropagation();
    if (category === 'menu') {
      setMenuDragActive(true);
    } else {
      setOffersDragActive(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, category: 'menu' | 'offers') => {
    e.preventDefault();
    e.stopPropagation();
    if (category === 'menu') {
      setMenuDragActive(false);
    } else {
      setOffersDragActive(false);
    }
  };

  const handleInputClick = (category: 'menu' | 'offers') => {
    if (category === 'menu') {
      menuInputRef.current?.click();
    } else {
      offersInputRef.current?.click();
    }
  };
  
  // Clear file error when user interactions change
  const resetFileError = () => {
    if (fileError) {
      setFileError(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {fileError && (
        <Alert variant="destructive" className="md:col-span-2 mb-0">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{fileError}</AlertDescription>
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-auto h-5 w-5"
            onClick={() => setFileError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Upload Menu</h2>
            {filePreview && filePreview.type === 'menu' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => handleInputClick('menu')}
              >
                Change
              </Button>
            )}
          </div>
          
          {filePreview && filePreview.type === 'menu' ? (
            <div className="relative group">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                {filePreview.fileType === 'image' ? (
                  <img 
                    src={filePreview.url} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <FileText className="h-16 w-16 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{filePreview.name}</p>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-background" 
                  onClick={() => handleInputClick('menu')}
                >
                  Replace File
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition cursor-pointer flex flex-col items-center justify-center min-h-[180px] ${menuDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, 'menu')}
              onDragLeave={(e) => handleDragLeave(e, 'menu')}
              onDrop={(e) => handleDrop(e, 'menu')}
              onClick={() => handleInputClick('menu')}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="mb-1 font-medium">Drag & drop or click to upload</p>
              <p className="text-sm text-muted-foreground">PDF, PNG, or JPG (max 10MB)</p>
              {uploading && filePreview?.type === 'menu' && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="animate-pulse">Uploading...</span>
                </div>
              )}
            </div>
          )}
          
          <input
            ref={menuInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              resetFileError();
              handleFileUpload(e, 'menu');
            }}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Upload Offers</h2>
            {filePreview && filePreview.type === 'offers' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => handleInputClick('offers')}
              >
                Change
              </Button>
            )}
          </div>
          
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
              <Label>End Date & Time (Optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
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
                      disabled={(date) => date < new Date() && !isSameDay(date, new Date())}
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
            
            {filePreview && filePreview.type === 'offers' ? (
              <div className="relative group">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                  {filePreview.fileType === 'image' ? (
                    <img 
                      src={filePreview.url} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4">
                      <FileText className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{filePreview.name}</p>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-background" 
                    onClick={() => handleInputClick('offers')}
                  >
                    Replace File
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition cursor-pointer flex flex-col items-center justify-center min-h-[180px] ${offersDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'} ${(!isAllBranches && !selectedBranch) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, 'offers')}
                onDragLeave={(e) => handleDragLeave(e, 'offers')}
                onDrop={(e) => (!isAllBranches && !selectedBranch) ? null : handleDrop(e, 'offers')}
                onClick={() => (!isAllBranches && !selectedBranch) ? null : handleInputClick('offers')}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="mb-1 font-medium">Drag & drop or click to upload</p>
                <p className="text-sm text-muted-foreground">PDF, PNG, or JPG (max 10MB)</p>
                {!isAllBranches && !selectedBranch && (
                  <p className="mt-2 text-sm text-destructive font-medium">Please select a branch first</p>
                )}
                {uploading && filePreview?.type === 'offers' && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="animate-pulse">Uploading...</span>
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={offersInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                resetFileError();
                handleFileUpload(e, 'offers');
              }}
              className="hidden"
              disabled={uploading || (!isAllBranches && !selectedBranch)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

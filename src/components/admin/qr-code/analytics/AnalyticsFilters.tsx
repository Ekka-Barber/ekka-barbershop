
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QRCode } from '@/types/admin';

interface AnalyticsFiltersProps {
  qrCodes: QRCode[];
  selectedQrId: string | null;
  timeRange: string;
  onSelectQrId: (id: string) => void;
  onTimeRangeChange: (range: string) => void;
}

export const AnalyticsFilters = ({
  qrCodes,
  selectedQrId,
  timeRange,
  onSelectQrId,
  onTimeRangeChange
}: AnalyticsFiltersProps) => {
  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select 
        value={selectedQrId || ''} 
        onValueChange={onSelectQrId}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select QR Code" />
        </SelectTrigger>
        <SelectContent>
          {qrCodes.map(qr => (
            <SelectItem key={qr.id} value={qr.id}>
              {qr.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={timeRange} 
        onValueChange={onTimeRangeChange}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

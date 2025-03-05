
import React from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { BlockedDate } from "@/types/admin";

interface BlockedDatesListProps {
  blockedDates: BlockedDate[];
  isLoading: boolean;
  onUnblockDate: (date: Date) => Promise<void>;
}

export const BlockedDatesList = ({ 
  blockedDates, 
  isLoading, 
  onUnblockDate 
}: BlockedDatesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (blockedDates.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-600">No Blocked Dates</h3>
        <p className="text-gray-500 mt-1">All dates are currently available for booking.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blockedDates.map((blockedDate) => (
            <TableRow key={blockedDate.id}>
              <TableCell className="font-medium">
                {format(new Date(blockedDate.date), "PPP")}
              </TableCell>
              <TableCell>{blockedDate.reason || "No reason provided"}</TableCell>
              <TableCell>{blockedDate.is_recurring ? "Yes" : "No"}</TableCell>
              <TableCell>{format(new Date(blockedDate.created_at), "PP")}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnblockDate(new Date(blockedDate.date))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

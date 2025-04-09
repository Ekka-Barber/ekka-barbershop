import React, { useState, useCallback, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, isWeekend } from "date-fns";
import { BlockedDatesList } from "./BlockedDatesList";
import { useBlockedDates } from "@/hooks/useBlockedDates";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const BookingManagement = React.memo(() => {
  // Start with empty array - no pre-selected dates
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const { 
    blockedDates, 
    isLoading, 
    blockDate, 
    unblockDate, 
    isBlocked 
  } = useBlockedDates();
  
  // Get the most recently selected date for actions that need a single date
  const mostRecentDate = useMemo(() => 
    selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : undefined,
    [selectedDates]
  );

  // Memoize the block multiple dates handler
  const handleBlockDates = useCallback(async () => {
    if (selectedDates.length === 0) return;
    
    try {
      // Process each selected date
      for (const date of selectedDates) {
        if (!isBlocked(date)) {
          await blockDate({
            date,
            reason: reason || (isWeekend(date) ? "Weekend" : "Blocked by admin"),
            is_recurring: isRecurring
          });
        }
      }
      
      // Clear selection after blocking
      setSelectedDates([]);
      setReason("");
    } catch (error) {
      console.error('Error blocking dates:', error);
    }
  }, [selectedDates, reason, isRecurring, blockDate, isBlocked]);

  // Memoize the unblock handler for a single date
  const handleUnblockDate = useCallback(async (date: Date) => {
    try {
      await unblockDate(date);
      
      // Remove the date from selection after unblocking
      setSelectedDates(prevDates => 
        prevDates.filter(d => !isSameDay(d, date))
      );
    } catch (error) {
      console.error('Error unblocking date:', error);
    }
  }, [unblockDate]);

  // Memoize the date format for display
  const selectedDatesText = useMemo(() => {
    if (selectedDates.length === 0) {
      return "No dates selected";
    } else if (selectedDates.length === 1) {
      return format(selectedDates[0], "PPPP");
    } else {
      return `${selectedDates.length} dates selected`;
    }
  }, [selectedDates]);
  
  // Handle tab change without scrolling to top
  const handleTabChange = useCallback((value: string) => {
    // Prevent default browser behavior
    window.history.pushState(null, '', window.location.href);
    setActiveTab(value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-muted-foreground">Manage available booking dates and times</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="calendar" onClick={(e) => e.preventDefault()}>Calendar View</TabsTrigger>
            <TabsTrigger value="list" onClick={(e) => e.preventDefault()}>Blocked Dates List</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Date Selection</CardTitle>
                <CardDescription>
                  Select multiple dates to block or unblock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  className="rounded-md border"
                  modifiers={{
                    blocked: (date) => isBlocked(date),
                    weekend: (date) => isWeekend(date)
                  }}
                  modifiersStyles={{
                    blocked: {
                      backgroundColor: "rgb(254 226 226)",
                      color: "rgb(185 28 28)",
                      fontWeight: "bold"
                    },
                    weekend: {
                      backgroundColor: "rgb(243 244 246)",
                      color: "rgb(107 114 128)"
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedDates.length > 0 
                    ? `${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''} selected` 
                    : "No dates selected - click dates to select"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Date Actions</CardTitle>
                <CardDescription>
                  Manage settings for {selectedDatesText}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="text-gray-500" />
                      <div>
                        {selectedDates.length > 0 ? (
                          <p>
                            {selectedDates.every(date => isBlocked(date)) ? (
                              <span className="text-destructive font-medium">
                                All selected dates are blocked
                              </span>
                            ) : selectedDates.some(date => isBlocked(date)) ? (
                              <span className="text-amber-600 font-medium">
                                Some selected dates are blocked
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium">
                                All selected dates are available
                              </span>
                            )}
                          </p>
                        ) : (
                          <p>Select dates to see their status</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Input
                          id="reason"
                          placeholder="e.g., Holiday, Maintenance"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="recurring">Recurring</Label>
                          <p className="text-xs text-muted-foreground">
                            Block these dates every year
                          </p>
                        </div>
                        <Switch
                          id="recurring"
                          checked={isRecurring}
                          onCheckedChange={setIsRecurring}
                        />
                      </div>
                      
                      <Button
                        className="w-full"
                        disabled={selectedDates.length === 0 || selectedDates.every(date => isBlocked(date))}
                        onClick={handleBlockDates}
                      >
                        {selectedDates.length > 1 
                          ? `Block ${selectedDates.length} selected dates` 
                          : selectedDates.length === 1 
                            ? `Block ${format(selectedDates[0], "MMMM d, yyyy")}` 
                            : "Select dates to block"}
                      </Button>

                      {selectedDates.length === 1 && isBlocked(selectedDates[0]) && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUnblockDate(selectedDates[0])}
                        >
                          Unblock {format(selectedDates[0], "MMMM d, yyyy")}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <BlockedDatesList 
            blockedDates={blockedDates} 
            isLoading={isLoading} 
            onUnblockDate={unblockDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
});

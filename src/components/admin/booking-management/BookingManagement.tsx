
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, isWeekend } from "date-fns";
import { BlockedDatesList } from "./BlockedDatesList";
import { BlockDateForm } from "./BlockDateForm";
import { useBlockedDates } from "@/hooks/useBlockedDates";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";

export const BookingManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("calendar");
  const { 
    blockedDates, 
    isLoading, 
    blockDate, 
    unblockDate, 
    isBlocked 
  } = useBlockedDates();
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleToggleBlock = async () => {
    if (!selectedDate) return;
    
    if (isBlocked(selectedDate)) {
      await unblockDate(selectedDate);
    } else {
      await blockDate({
        date: selectedDate,
        reason: isWeekend(selectedDate) ? "Weekend" : "Blocked by admin",
        is_recurring: false
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-muted-foreground">Manage available booking dates and times</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">Blocked Dates List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Date Selection</CardTitle>
                <CardDescription>
                  Select dates to block or unblock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Date Actions</CardTitle>
                <CardDescription>
                  Manage settings for {selectedDate ? format(selectedDate, "PPPP") : "the selected date"}
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
                        {selectedDate ? (
                          <p>
                            {isBlocked(selectedDate) ? (
                              <span className="text-destructive font-medium">
                                Currently blocked
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium">
                                Available for booking
                              </span>
                            )}
                          </p>
                        ) : (
                          <p>Select a date to see its status</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleToggleBlock}
                      variant={isBlocked(selectedDate) ? "outline" : "destructive"}
                      className="w-full"
                      disabled={!selectedDate}
                    >
                      {isBlocked(selectedDate) ? "Unblock Date" : "Block Date"}
                    </Button>
                    
                    {!isBlocked(selectedDate) && (
                      <BlockDateForm 
                        selectedDate={selectedDate}
                        onBlockDate={blockDate}
                      />
                    )}
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
};

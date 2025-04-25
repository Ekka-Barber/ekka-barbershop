import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface DateRangePickerProps {
  date: DateRange
  onDateChange: (date: DateRange) => void
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const dateDisplay = React.useMemo(() => {
    if (!date?.from) return <span>Pick a date</span>

    if (date.to) {
      return (
        <span className="text-sm sm:text-base">
          {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
        </span>
      )
    }

    return <span>{format(date.from, "LLL dd, y")}</span>
  }, [date])

  // For desktop: use Popover
  if (isDesktop) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // For mobile: use Sheet with improved styling
  return (
    <div className={cn("grid gap-2", className)}>
      <Sheet open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <SheetTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateDisplay}
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[450px] pb-0 pt-4 bg-white dark:bg-slate-950 border-t dark:border-slate-800"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="text-center">Select date range</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-hidden pb-4">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(selectedDate) => {
                  onDateChange(selectedDate as DateRange)
                  if (selectedDate?.from && selectedDate?.to) {
                    setIsCalendarOpen(false)
                  }
                }}
                numberOfMonths={1}
                className="mx-auto bg-white dark:bg-slate-950"
                classNames={{
                  day_today: "bg-primary/20 text-primary-foreground font-bold",
                  day: "h-9 w-9 text-sm focus-visible:bg-primary focus-visible:text-primary-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  caption: "text-sm font-medium",
                  table: "w-full border-collapse space-y-1",
                  head_cell: "text-primary/50 rounded-md font-medium text-xs w-9",
                  cell: "h-9 w-9 text-center text-sm p-0 relative",
                  nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground dark:text-slate-300"
                }}
              />
            </div>
            {date?.from && !date?.to && (
              <div className="border-t p-3 text-center text-sm bg-accent/10 dark:bg-slate-900">
                <span className="text-primary dark:text-white">
                  Selected: {format(date.from, "MMM dd, yyyy")} - Select end date
                </span>
              </div>
            )}
            {date?.from && date?.to && (
              <div className="border-t p-3 text-center text-sm bg-primary/10 dark:bg-primary/20">
                <span className="text-primary font-medium dark:text-white">
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
                </span>
              </div>
            )}
            <Button
              onClick={() => setIsCalendarOpen(false)}
              className="w-full rounded-none rounded-b-lg h-12 mt-auto"
              disabled={!date?.from || !date?.to}
            >
              {date?.from && date?.to ? "Confirm" : "Cancel"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

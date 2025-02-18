
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";
import { DropOffPoint } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DropOffAnalysisProps {
  dropOffPoints: DropOffPoint[];
}

export const DropOffAnalysisCard = ({ dropOffPoints }: DropOffAnalysisProps) => {
  const sortedPoints = [...dropOffPoints].sort((a, b) => b.exitRate - a.exitRate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Drop-off Analysis</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>
          Identify where users are leaving the booking process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Exit Rate</TableHead>
                <TableHead>Avg. Time Before Exit</TableHead>
                <TableHead>Previous Steps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPoints.map((point, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{point.page}</TableCell>
                  <TableCell className="text-right">
                    {point.exitRate.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {Math.round(point.averageTimeBeforeExit / 60)} min
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {point.previousPages.join(" → ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

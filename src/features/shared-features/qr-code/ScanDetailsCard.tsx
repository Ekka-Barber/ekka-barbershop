
import React from 'react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@shared/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/ui/components/table";

interface ScanDetail {
  scanned_at: string;
  device_type: string;
  referrer: string;
  location?: string;
}

interface ScanDetailsCardProps {
  recentScans: ScanDetail[];
}

export const ScanDetailsCard = ({ recentScans }: ScanDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Scan Details</CardTitle>
        <CardDescription>Recent scans of this QR code</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentScans.length > 0 ? (
              recentScans.map((scan, i) => {
                // Parse referrer to get a readable source
                let source = 'Direct';
                if (scan.referrer) {
                  try {
                    const url = new URL(scan.referrer);
                    source = url.hostname;
                  } catch {
                    source = scan.referrer;
                  }
                }
                
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{scan.device_type || 'Unknown'}</TableCell>
                    <TableCell>{source}</TableCell>
                    <TableCell className="text-right">{scan.location || 'Unknown'}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No scan data available for this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

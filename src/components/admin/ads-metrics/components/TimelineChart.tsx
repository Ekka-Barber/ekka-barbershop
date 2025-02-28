
import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart,
  Area, ReferenceLine
} from 'recharts';
import { TimelineDataPoint } from '../types';
import { format, parseISO } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TimelineChartProps {
  timelineData: TimelineDataPoint[];
}

export const TimelineChart = ({ timelineData }: TimelineChartProps) => {
  const [activeChart, setActiveChart] = useState('traffic');
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch (error) {
      return dateStr;
    }
  };
  
  // Calculate daily conversion rates
  const dataWithConversionRate = timelineData.map(day => ({
    ...day,
    conversion_rate: day.visits > 0 ? (day.conversions / day.visits) * 100 : 0,
    roas: day.costs && day.costs > 0 ? ((day.revenue || 0) / day.costs) * 100 : 0
  }));

  if (timelineData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Timeline</CardTitle>
          <CardDescription>No data available for the selected date range</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Timeline</CardTitle>
        <CardDescription>Track your campaign performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="traffic" value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="mb-4">
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
            <TabsTrigger value="costs">Costs & ROI</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="traffic">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Visits']}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="visits" name="Total Visits" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="tiktok_visits" name="TikTok Visits" stroke="#FE2C55" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="conversions">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dataWithConversionRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'Conversion Rate') return [`${value.toFixed(1)}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="conversion_rate" name="Conversion Rate" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="devices">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [value, name]}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Bar dataKey="deviceBreakdown.mobile" name="Mobile" stackId="a" fill="#8884d8" />
                  <Bar dataKey="deviceBreakdown.desktop" name="Desktop" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="deviceBreakdown.tablet" name="Tablet" stackId="a" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="costs">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dataWithConversionRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 200]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'ROAS') return [`${value.toFixed(1)}%`, name];
                      return [`${value} SAR`, name];
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="costs" name="Costs" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#ff7300" />
                  <ReferenceLine y={100} yAxisId="right" stroke="green" strokeDasharray="3 3" label="Break Even" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'Bounce Rate') return [`${(value * 100).toFixed(1)}%`, name];
                      if (name === 'Avg Session Duration') return [`${value.toFixed(0)} sec`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bounceRate" name="Bounce Rate" fill="#ff8042" />
                  <Line yAxisId="right" type="monotone" dataKey="avgSessionDuration" name="Avg Session Duration" stroke="#8884d8" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

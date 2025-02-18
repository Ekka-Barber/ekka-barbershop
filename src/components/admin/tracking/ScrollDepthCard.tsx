
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ScrollData {
  depth_percentage: number;
  count: number;
}

export const ScrollDepthCard = ({ pageUrl }: { pageUrl: string }) => {
  const { data: scrollData } = useQuery({
    queryKey: ['scroll-depth', pageUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('click_tracking')
        .select('scroll_y, content_height')
        .eq('page_url', pageUrl);
      
      if (error) throw error;

      // Calculate scroll depth percentages and group them
      const depthMap = new Map<number, number>();
      data.forEach(scroll => {
        const percentage = Math.min(100, Math.round((scroll.scroll_y / scroll.content_height) * 100));
        depthMap.set(percentage, (depthMap.get(percentage) || 0) + 1);
      });

      return Array.from(depthMap.entries()).map(([depth_percentage, count]) => ({
        depth_percentage,
        count
      }));
    }
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Scroll Depth Analysis</CardTitle>
        <CardDescription>How far users scroll on the page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scrollData}>
              <XAxis 
                dataKey="depth_percentage" 
                label={{ value: 'Page Depth (%)', position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                label={{ value: 'Number of Views', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

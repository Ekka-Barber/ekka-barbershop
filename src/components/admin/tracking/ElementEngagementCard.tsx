
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ElementEngagement {
  element_id: string;
  clicks: number;
}

export const ElementEngagementCard = ({ pageUrl }: { pageUrl: string }) => {
  const { data: elementData } = useQuery({
    queryKey: ['element-engagement', pageUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('click_tracking')
        .select('element_id, element_class')
        .eq('page_url', pageUrl)
        .not('element_id', 'is', null);
      
      if (error) throw error;

      const elementMap = new Map<string, number>();
      data.forEach(click => {
        if (click.element_id) {
          elementMap.set(click.element_id, (elementMap.get(click.element_id) || 0) + 1);
        }
      });

      return Array.from(elementMap.entries())
        .map(([element_id, clicks]) => ({
          element_id,
          clicks
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10); // Top 10 most clicked elements
    }
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Element Engagement</CardTitle>
        <CardDescription>Most interacted elements on the page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={elementData} layout="vertical">
              <XAxis type="number" />
              <YAxis 
                dataKey="element_id" 
                type="category" 
                width={150}
              />
              <Tooltip />
              <Bar dataKey="clicks" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

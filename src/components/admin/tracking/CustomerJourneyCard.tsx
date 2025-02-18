
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

interface JourneyNode {
  name: string;
}

interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

interface CustomerJourneyProps {
  nodes: JourneyNode[];
  links: JourneyLink[];
}

export const CustomerJourneyCard = ({ nodes, links }: CustomerJourneyProps) => {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Customer Journey Flow</CardTitle>
        <CardDescription>Visualization of customer paths through the booking process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={{
                nodes: nodes.map(node => ({ name: node.name })),
                links: links
              }}
              node={{
                fill: "hsl(var(--primary))",
                opacity: 0.8
              }}
              link={{
                stroke: "hsl(var(--primary))",
                opacity: 0.2
              }}
              nodePadding={50}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

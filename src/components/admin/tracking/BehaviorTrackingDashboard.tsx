
import { DateRange, DateRangeSelector } from "./DateRangeSelector";
import { useState } from "react";
import { HeatMapCard } from "./HeatMapCard";
import { ScrollDepthCard } from "./ScrollDepthCard";
import { ElementEngagementCard } from "./ElementEngagementCard";
import { CustomerJourneyCard } from "./CustomerJourneyCard";
import { useTrackingData } from "./useTrackingData";
import { processCustomerJourney } from "./trackingUtils";

const BehaviorTrackingDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { interactionEvents } = useTrackingData(dateRange);
  const journeyData = interactionEvents ? processCustomerJourney(interactionEvents) : { nodes: [], links: [] };

  return (
    <div className="space-y-8">
      <DateRangeSelector onRangeChange={setDateRange} />
      
      <CustomerJourneyCard 
        nodes={journeyData.nodes}
        links={journeyData.links}
      />

      <HeatMapCard pageUrl="/customer" />
      
      <ScrollDepthCard pageUrl="/customer" />
      
      <ElementEngagementCard pageUrl="/customer" />
    </div>
  );
};

export default BehaviorTrackingDashboard;

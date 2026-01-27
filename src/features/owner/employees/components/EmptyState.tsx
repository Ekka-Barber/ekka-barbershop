import { User } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@shared/ui/components/card';

export const EmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No employees found</p>
      </CardContent>
    </Card>
  );
};

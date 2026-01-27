import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@shared/ui/components/card';

interface DocumentSummaryCardsProps {
  totalDocuments: number;
  validDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
}

export const DocumentSummaryCards: React.FC<DocumentSummaryCardsProps> = ({
  totalDocuments,
  validDocuments,
  expiringDocuments,
  expiredDocuments,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Total</p>
              <p className="text-lg sm:text-2xl font-bold">{totalDocuments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Valid</p>
              <p className="text-lg sm:text-2xl font-bold text-success">
                {validDocuments}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Expiring</p>
              <p className="text-lg sm:text-2xl font-bold text-warning">
                {expiringDocuments}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Expired</p>
              <p className="text-lg sm:text-2xl font-bold text-destructive">
                {expiredDocuments}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

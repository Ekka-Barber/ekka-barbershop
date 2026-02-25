import { FileCheck, Shield, AlertTriangle } from 'lucide-react';

import { Card, CardContent } from '@shared/ui/components/card';

interface DocumentInsuranceStatusProps {
  documents: {
    expired: number;
    expiring: number;
    valid: number;
    total: number;
  };
  insurance: {
    expired: number;
    expiring: number;
    valid: number;
    total: number;
  };
  onClick?: () => void;
}

interface StatusProgressBarProps {
  valid: number;
  expiring: number;
  expired: number;
  total: number;
}

const StatusProgressBar = ({ valid, expiring, expired, total }: StatusProgressBarProps) => {
  if (total === 0) {
    return (
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-300 w-full" />
      </div>
    );
  }

  const validPercent = (valid / total) * 100;
  const expiringPercent = (expiring / total) * 100;
  const expiredPercent = (expired / total) * 100;

  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
      {validPercent > 0 && (
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${validPercent}%` }}
        />
      )}
      {expiringPercent > 0 && (
        <div
          className="h-full bg-amber-500 transition-all duration-500"
          style={{ width: `${expiringPercent}%` }}
        />
      )}
      {expiredPercent > 0 && (
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${expiredPercent}%` }}
        />
      )}
    </div>
  );
};

interface StatusLegendProps {
  valid: number;
  expiring: number;
  expired: number;
}

const StatusLegend = ({ valid, expiring, expired }: StatusLegendProps) => (
  <div className="flex items-center gap-4 text-xs mt-2">
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-gray-600">ساري ({valid})</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-amber-500" />
      <span className="text-gray-600">قريب ({expiring})</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-gray-600">منتهي ({expired})</span>
    </div>
  </div>
);

export const DocumentInsuranceStatus = ({
  documents,
  insurance,
  onClick,
}: DocumentInsuranceStatusProps) => {
  const hasIssues = documents.expired > 0 || insurance.expired > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${hasIssues ? 'ring-2 ring-red-200' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-50">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">المستندات</p>
                <p className="text-xs text-gray-500">{documents.total} مستند</p>
              </div>
            </div>
            {documents.expired > 0 && (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">{documents.expired}</span>
              </div>
            )}
          </div>
          <StatusProgressBar
            valid={documents.valid}
            expiring={documents.expiring}
            expired={documents.expired}
            total={documents.total}
          />
          <StatusLegend
            valid={documents.valid}
            expiring={documents.expiring}
            expired={documents.expired}
          />
        </CardContent>
      </Card>

      <Card
        className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${insurance.expired > 0 ? 'ring-2 ring-red-200' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-50">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">التأمين</p>
                <p className="text-xs text-gray-500">{insurance.total} موظف</p>
              </div>
            </div>
            {insurance.expired > 0 && (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">{insurance.expired}</span>
              </div>
            )}
          </div>
          <StatusProgressBar
            valid={insurance.valid}
            expiring={insurance.expiring}
            expired={insurance.expired}
            total={insurance.total}
          />
          <StatusLegend
            valid={insurance.valid}
            expiring={insurance.expiring}
            expired={insurance.expired}
          />
        </CardContent>
      </Card>
    </div>
  );
};

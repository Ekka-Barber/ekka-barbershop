import { ExternalLink, MapPin, MapPinned } from 'lucide-react';

import type { InsuranceHospital } from '@shared/types/domains';
import { Badge } from '@shared/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

interface NetworkHospitalsProps {
  hospitals: InsuranceHospital[];
  cityName: string | null;
  companyName: string;
  isLoading: boolean;
}

export const NetworkHospitals: React.FC<NetworkHospitalsProps> = ({
  hospitals,
  cityName,
  companyName,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8] pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-[#4a3f2f]">
            <MapPinned className="h-4 w-4" />
            المستشفيات المعتمدة
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-[#7a6b55]">
          جاري التحميل...
        </CardContent>
      </Card>
    );
  }

  if (!cityName) {
    return (
      <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8] pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-[#4a3f2f]">
            <MapPinned className="h-4 w-4" />
            المستشفيات المعتمدة
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-[#7a6b55]">
          لا يمكن تحديد المدينة - تأكد من أن الموظف مرتبط بفرع
        </CardContent>
      </Card>
    );
  }

  if (hospitals.length === 0) {
    return (
      <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8] pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-[#4a3f2f]">
            <MapPinned className="h-4 w-4" />
            المستشفيات المعتمدة في {cityName}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-[#7a6b55]">
          لا توجد مستشفيات معتمدة لشركة {companyName} في {cityName}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-[#4a3f2f]">
          <MapPinned className="h-4 w-4" />
          المستشفيات المعتمدة في {cityName}
        </CardTitle>
        <p className="text-sm text-[#7a6b55]">
          المستشفيات التالية تقبل تأمين {companyName} في {cityName}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="flex items-start justify-between rounded-lg border border-[#e8dcc4] bg-[#fffbf4] p-3"
            >
              <div className="flex-1">
                <p className="font-medium text-[#3a3020]">{hospital.name}</p>
                <Badge variant="outline" className="mt-1 border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40]">
                  <MapPin className="me-1 h-3 w-3" />
                  {hospital.city}
                </Badge>
              </div>
              {hospital.google_maps_url && (
                <a
                  href={hospital.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1.5 text-[#2563eb] hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

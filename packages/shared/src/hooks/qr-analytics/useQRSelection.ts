
import { useState, useEffect } from 'react';

import { QRCode } from '@shared/types/admin';

export function useQRSelection(qrCodes: QRCode[]) {
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7days');
  
  useEffect(() => {
    if (qrCodes.length > 0 && !selectedQrId) {
      setSelectedQrId(qrCodes[0].id);
    }
  }, [qrCodes, selectedQrId]);

  return {
    selectedQrId,
    setSelectedQrId,
    timeRange,
    setTimeRange
  };
}

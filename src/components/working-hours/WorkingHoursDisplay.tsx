
import { Fragment, type ReactNode } from "react";
import { formatWorkingHoursForDisplay } from "@/utils/workingHoursUtils";

interface WorkingHoursDisplayProps {
  isArabic: boolean;
  workingHours: any;
}

export const WorkingHoursDisplay = ({ isArabic, workingHours }: WorkingHoursDisplayProps): ReactNode => {
  const timeRanges = formatWorkingHoursForDisplay(workingHours);
  
  return (
    <Fragment>
      <div className="text-[#333333] font-medium">{isArabic ? 'ساعات العمل اليوم' : "Today's working Hrs"}</div>
      <div className="text-[#C4A36F]">{timeRanges.join(isArabic ? ' , ' : ', ')}</div>
    </Fragment>
  );
};

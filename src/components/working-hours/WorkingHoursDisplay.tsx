
import { Fragment, type ReactNode } from "react";

interface WorkingHoursDisplayProps {
  isArabic: boolean;
  timeRanges: string[];
}

export const WorkingHoursDisplay = ({ isArabic, timeRanges }: WorkingHoursDisplayProps): ReactNode => {
  return (
    <Fragment>
      <div className="text-[#333333] font-medium">{isArabic ? 'ساعات العمل اليوم' : "Today's working Hrs"}</div>
      <div>{timeRanges.join(isArabic ? ' , ' : ', ')}</div>
    </Fragment>
  );
};

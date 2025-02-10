
import { Fragment, type ReactNode } from "react";

interface WorkingHoursDisplayProps {
  isArabic: boolean;
  timeRanges: string[];
}

export const WorkingHoursDisplay = ({ isArabic, timeRanges }: WorkingHoursDisplayProps): ReactNode => {
  return (
    <Fragment>
      <div>{isArabic ? 'ساعات العمل اليوم' : "Today's hours"}</div>
      <div>{timeRanges.join(isArabic ? ' , ' : ', ')}</div>
    </Fragment>
  );
};

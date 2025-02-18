
import { BookingStepsContainer } from "./BookingStepsContainer";
import { Branch } from "@/types/booking";

interface BookingStepsProps {
  branch: Branch;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  return <BookingStepsContainer branch={branch} />;
};

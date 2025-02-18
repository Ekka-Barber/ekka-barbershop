import { CustomerDetails, Branch } from '@/types/booking';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DetailsStepProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  totalPrice: number;
  branch: Branch;
}

export const DetailsStep = ({
  customerDetails,
  onCustomerDetailsChange,
  totalPrice,
  branch
}: DetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={customerDetails.name}
          onChange={(e) => onCustomerDetailsChange('name', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel"
          id="phone"
          value={customerDetails.phone}
          onChange={(e) => onCustomerDetailsChange('phone', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={customerDetails.email}
          onChange={(e) => onCustomerDetailsChange('email', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          type="text"
          id="notes"
          value={customerDetails.notes}
          onChange={(e) => onCustomerDetailsChange('notes', e.target.value)}
        />
      </div>
      <div>
        <p>Total Price: ${totalPrice}</p>
      </div>
    </div>
  );
};


import { AlertTriangle } from "lucide-react";

interface EmptyServiceStateProps {
  message: string;
  description: string;
}

export const EmptyServiceState = ({ message, description }: EmptyServiceStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-yellow-500" />
      <h3 className="text-lg font-semibold">{message}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

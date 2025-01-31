import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface URLManagerProps {
  currentUrl: string | undefined;
  newUrl: string;
  setNewUrl: (url: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

const URLManager = ({ 
  currentUrl, 
  newUrl, 
  setNewUrl, 
  handleSubmit,
  isUpdating 
}: URLManagerProps) => {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div>
        <h3 className="font-medium mb-2">Current URL</h3>
        <p className="text-sm text-muted-foreground break-all">
          {currentUrl || "No URL set"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">New URL</h3>
          <Input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter new URL"
            className="w-full"
          />
        </div>
        <Button 
          type="submit" 
          disabled={!newUrl || isUpdating}
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update URL"
          )}
        </Button>
      </form>
    </div>
  );
};

export default URLManager;
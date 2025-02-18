
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoyaltyProgram, defaultProgram } from "../types";
import { convertDatabaseToProgram } from "../utils/programConverter";

export function useLoyaltyProgram() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_program")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (data) {
        setProgram(convertDatabaseToProgram(data));
      } else {
        const { data: newProgram, error: createError } = await supabase
          .from("loyalty_program")
          .insert([defaultProgram])
          .select()
          .single();

        if (createError) throw createError;
        setProgram(convertDatabaseToProgram(newProgram));
      }
    } catch (error) {
      console.error("Error fetching loyalty program:", error);
      toast({
        description: "Failed to load loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!program?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("loyalty_program")
        .update({
          points_required: program.points_required,
          tiers: program.tiers,
          happy_hour: program.happy_hour,
          description_template: program.description_template,
          updated_at: new Date().toISOString(),
        })
        .eq("id", program.id);

      if (error) throw error;

      toast({
        description: "Loyalty program settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving loyalty program:", error);
      toast({
        description: "Failed to save loyalty program settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, []);

  return {
    program,
    setProgram,
    loading,
    saving,
    handleSave
  };
}

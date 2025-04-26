import { useState, useCallback } from 'react';
import { FormulaPlan } from '../types/salary';
import { FormulaPlanService, StoredFormulaPlan } from '../api/formulaPlanService';

/**
 * Interface for the formula plan API hook
 */
interface UseFormulaPlanApiResult {
  plans: StoredFormulaPlan[];
  templates: StoredFormulaPlan[];
  selectedPlan: StoredFormulaPlan | null;
  versions: StoredFormulaPlan[];
  isLoading: boolean;
  error: Error | null;
  loadPlans: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadPlan: (id: string) => Promise<void>;
  loadVersions: (id: string) => Promise<void>;
  savePlan: (plan: FormulaPlan, name: string, description?: string) => Promise<StoredFormulaPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;
}

/**
 * Hook for interacting with formula plan API
 */
export const useFormulaPlanApi = (): UseFormulaPlanApiResult => {
  const [plans, setPlans] = useState<StoredFormulaPlan[]>([]);
  const [templates, setTemplates] = useState<StoredFormulaPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<StoredFormulaPlan | null>(null);
  const [versions, setVersions] = useState<StoredFormulaPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Create an instance of the formula plan service
  const formulaPlanService = new FormulaPlanService();

  /**
   * Load all formula plans
   */
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.getPlans();
      
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        throw new Error(response.error || 'Failed to load plans');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading plans'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load formula templates
   */
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.getTemplates();
      
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        throw new Error(response.error || 'Failed to load templates');
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading templates'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load a specific formula plan by ID
   */
  const loadPlan = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.getPlan(id);
      
      if (response.success && response.data) {
        setSelectedPlan(response.data);
      } else {
        throw new Error(response.error || 'Failed to load plan');
      }
    } catch (err) {
      console.error('Error loading plan:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading plan'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load version history for a formula plan
   */
  const loadVersions = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.getPlanVersions(id);
      
      if (response.success && response.data) {
        setVersions(response.data);
      } else {
        throw new Error(response.error || 'Failed to load versions');
      }
    } catch (err) {
      console.error('Error loading versions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading versions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save a formula plan
   */
  const savePlan = useCallback(async (
    plan: FormulaPlan, 
    name: string, 
    description?: string
  ): Promise<StoredFormulaPlan | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.savePlan(plan, name, description);
      
      if (response.success && response.data) {
        // Update the plans list if the plan already exists
        if (plan.id) {
          setPlans(prev => prev.map(p => 
            p.id === plan.id ? response.data! : p
          ));
        } else {
          // Add the new plan to the list
          setPlans(prev => [...prev, response.data!]);
        }
        
        // Update the selected plan
        setSelectedPlan(response.data);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to save plan');
      }
    } catch (err) {
      console.error('Error saving plan:', err);
      setError(err instanceof Error ? err : new Error('Unknown error saving plan'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a formula plan
   */
  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formulaPlanService.deletePlan(id);
      
      if (response.success) {
        // Remove the plan from the list
        setPlans(prev => prev.filter(p => p.id !== id));
        
        // Clear selected plan if it was deleted
        if (selectedPlan?.id === id) {
          setSelectedPlan(null);
        }
        
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete plan');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting plan'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan]);

  return {
    plans,
    templates,
    selectedPlan,
    versions,
    isLoading,
    error,
    loadPlans,
    loadTemplates,
    loadPlan,
    loadVersions,
    savePlan,
    deletePlan,
  };
}; 

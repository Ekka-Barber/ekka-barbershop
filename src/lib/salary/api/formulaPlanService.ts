import { FormulaPlan } from '../types/salary';

/**
 * API version for formula plan API endpoints
 * Used for versioning to ensure backward compatibility
 */
export const FORMULA_API_VERSION = 'v1';

/**
 * Response structure for API calls
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Formula plan with metadata for storage
 */
export interface StoredFormulaPlan extends FormulaPlan {
  id: string;
  name: string;
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isTemplate?: boolean;
}

/**
 * Service for interacting with formula plan API endpoints
 */
export class FormulaPlanService {
  private baseUrl: string;
  
  constructor(baseUrl = '/api/salary/formula-plans') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Save or update a formula plan
   * @param plan The formula plan to save
   * @param name Name of the plan
   * @param description Optional description
   * @returns Promise with the saved plan
   */
  async savePlan(
    plan: FormulaPlan, 
    name: string, 
    description?: string
  ): Promise<ApiResponse<StoredFormulaPlan>> {
    try {
      const url = `${this.baseUrl}`;
      const planId = plan.id || crypto.randomUUID();
      
      const payload = {
        ...plan,
        id: planId,
        name,
        description,
        version: plan.version ? plan.version + 1 : 1,
        updatedAt: new Date().toISOString(),
        createdAt: plan.createdAt || new Date().toISOString()
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': FORMULA_API_VERSION,
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save formula plan');
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving formula plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Load a formula plan by ID
   * @param id The formula plan ID
   * @returns Promise with the loaded plan
   */
  async getPlan(id: string): Promise<ApiResponse<StoredFormulaPlan>> {
    try {
      const url = `${this.baseUrl}/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Version': FORMULA_API_VERSION,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load formula plan');
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading formula plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get all formula plans for the current user
   * @param includeTemplates Whether to include templates
   * @returns Promise with array of formula plans
   */
  async getPlans(includeTemplates = false): Promise<ApiResponse<StoredFormulaPlan[]>> {
    try {
      const url = `${this.baseUrl}?includeTemplates=${includeTemplates}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Version': FORMULA_API_VERSION,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch formula plans');
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching formula plans:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get all formula plan templates
   * @returns Promise with array of template plans
   */
  async getTemplates(): Promise<ApiResponse<StoredFormulaPlan[]>> {
    try {
      const url = `${this.baseUrl}/templates`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Version': FORMULA_API_VERSION,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch templates');
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching formula templates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Delete a formula plan
   * @param id The formula plan ID to delete
   * @returns Promise with success status
   */
  async deletePlan(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const url = `${this.baseUrl}/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-API-Version': FORMULA_API_VERSION,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete formula plan');
      }
      
      return {
        success: true,
        data: { id },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting formula plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get version history for a formula plan
   * @param id The formula plan ID
   * @returns Promise with array of plan versions
   */
  async getPlanVersions(id: string): Promise<ApiResponse<StoredFormulaPlan[]>> {
    try {
      const url = `${this.baseUrl}/${id}/versions`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Version': FORMULA_API_VERSION,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch plan versions');
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching plan versions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
} 

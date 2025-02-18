export type MarketingFunnelStage = 'landing' | 'service_browse' | 'datetime_select' | 'barber_select' | 'booking_complete';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type InteractionType = 
  | 'barber_select'
  | 'page_view'
  | 'dialog_open'
  | 'dialog_close'
  | 'service_select'
  | 'branch_select'
  | 'menu_view'
  | 'offer_view'
  | 'button_click'
  | 'form_interaction'
  | 'pdf_view'
  | 'language_switch'
  | 'category_select'
  | 'calendar_interaction'
  | 'profile_interaction'
  | 'location_interaction'
  | 'menu_open'
  | 'menu_close'
  | 'page_change'
  | 'zoom'
  | 'profile_view'
  | 'selection'
  | 'calendar_open'
  | 'calendar_close'
  | 'date_select'
  | 'category_view'
  | 'category_view_end'
  | 'service_selection_update'
  | 'service_view'
  | 'service_selection'
  | 'service_selection_complete'
  | 'session_end'
  | 'offer_view_start'
  | 'offer_view_end';

export interface BaseInteractionType {
  session_id?: string;
  device_type?: DeviceType;
  timestamp?: string;
  interaction_type: InteractionType;
  interaction_details?: Record<string, any>;
}

export interface DatabaseInteractionType extends BaseInteractionType {
  id: string;
  created_at: string;
}

export interface SessionData {
  id: string;
  created_at: string;
  session_id: string;
  device_type: DeviceType;
  last_active: string;
  timestamp: string;
}

export interface ServiceDiscoveryEvent extends BaseInteractionType {
  category_id?: string;
  service_id?: string;
  selected_service_name?: string;
  discovery_path?: string[];
  description_viewed?: boolean;
  price_viewed?: boolean;
}

export interface DateTimeEvent extends BaseInteractionType {
  selected_date?: string;
  selected_time?: string;
  calendar_view_type?: 'month' | 'week' | 'quick_select';
  days_in_advance?: number;
  time_slot_position?: string;
  quick_select_usage?: boolean;
}

export interface BarberSelectionEvent extends BaseInteractionType {
  barber_id: string;
  comparison_count?: number;
  time_to_selection_seconds?: number;
  availability_status: boolean;
  view_duration_seconds: number;
  selection_criteria?: {
    availability_based?: boolean;
    nationality_based?: boolean;
    time_slot_based?: boolean;
  };
}

export interface BranchSelectionEvent extends BaseInteractionType {
  branch_id?: string;
  dialog_open_time?: string;
  dialog_close_time?: string;
  selected_branch_name?: string;
  source_page: string;
}

export interface MenuInteractionEvent extends BaseInteractionType {
  menu_file_id?: string;
  view_duration_seconds?: number;
  zoom_actions?: number;
  page_changes?: number;
}

export interface OfferInteractionEvent extends BaseInteractionType {
  offer_id?: string;
  view_duration_seconds?: number;
}

export interface MarketingFunnelEvent extends BaseInteractionType {
  funnel_stage: MarketingFunnelStage;
  time_in_stage: number;
  conversion_successful: boolean;
  drop_off_point: boolean;
  entry_point: string;
  interaction_path: {
    path: string[];
    timestamps: number[];
  };
}

export interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

export interface BookingBehavior {
  step: string;
  timestamp: string;
}

export interface BookingData {
  id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser_info: any;
  services: any;
  total_price: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  barber_id: string;
  branch_id: string;
  updated_at: string;
}

export interface JourneyNode {
  id: string;
  name: string;
  index?: number;
}

export interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

export interface ServiceAnalytics {
  serviceName: string;
  viewCount: number;
  conversionRate: number;
  averageViewDuration: number;
}

export interface StepStats {
  name: string;
  count: number;
}

export interface ServiceStats {
  name: string;
  added: number;
  removed: number;
  net: number;
}

export const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];

export interface UserJourney {
  entryPoint: string;
  pathSteps: PathStep[];
  completionStatus: 'completed' | 'abandoned';
  duration: number;
  userAgent: string;
  timestamp: string;
}

export interface PathStep {
  page: string;
  timeSpent: number;
  interactions: UserInteraction[];
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'view';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserBehaviorMetrics {
  averageSessionDuration: number;
  bounceRate: number;
  completionRate: number;
  commonPaths: PathAnalysis[];
  dropOffPoints: DropOffPoint[];
}

export interface PathAnalysis {
  path: string[];
  frequency: number;
  averageDuration: number;
  successRate: number;
}

export interface DropOffPoint {
  page: string;
  exitRate: number;
  averageTimeBeforeExit: number;
  previousPages: string[];
}

export interface ProcessedJourneyData {
  nodes: JourneyNode[];
  links: JourneyLink[];
  dropOffPoints: DropOffPoint[];
  serviceBundles: ServiceBundle[];
  pathOptimizations: PathOptimization[];
}

export interface PathOptimization {
  currentPath: string[];
  suggestedPath: string[];
  potentialImpact: {
    conversionRate: number;
    timeToBook: number;
    dropOffReduction: number;
  };
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ServiceBundle {
  name: string;
  frequency: number;
  averageValue: number;
  conversionRate: number;
  services: string[];
  performanceMetrics: {
    timeToBook: number;
    customerSatisfaction: number;
    repeatBookingRate: number;
  };
}

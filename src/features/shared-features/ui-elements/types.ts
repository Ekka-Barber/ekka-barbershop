/**
 * Shared types for UI Elements Manager
 */

export interface UiElement {
    id: string;
    type: string;
    name: string;
    display_name: string;
    display_name_ar: string;
    description: string | null;
    description_ar: string | null;
    is_visible: boolean | null;
    display_order: number;
    icon: string | null;
    action: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export type IconType = string;

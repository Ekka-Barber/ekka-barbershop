# Ekka Barbershop Management App Development Standards

This document outlines the definitive coding standards and best practices for the Ekka Barbershop Management App. Following these guidelines consistently ensures high-quality, maintainable code across the entire codebase.

## Table of Contents
1. [Core Principles](#core-principles)
2. [Component Structure](#component-structure)
3. [TypeScript Standards](#typescript-standards)
4. [Styling Guidelines](#styling-guidelines)
5. [React Component Patterns](#react-component-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Error Handling](#error-handling)
9. [State Management](#state-management)
10. [File & Folder Organization](#file-and-folder-organization)
11. [Code Review Checklist](#code-review-checklist)

## Core Principles

### Development Philosophy
- **Customer-First Approach**: Prioritize barbershop customer and staff experience over technical elegance
- **Readability Over Cleverness**: Code should be easily understood by teammates
- **Consistency Is Key**: Follow established patterns across the entire codebase
- **Accessibility Is Non-Negotiable**: All components must meet WCAG AA standards
- **Early Returns**: Use early returns to reduce nesting and improve readability
- **DRY but Pragmatic**: Don't repeat yourself, but don't over-abstract prematurely

### Critical Commitments
- All code must be thoroughly tested before submission
- No TODO comments should be left in production code
- No incomplete features or implementations
- Always provide all required imports
- No placeholder or dummy code allowed
- All console.logs must be removed before submission
- No breaking changes without discussion and approval

## Component Structure

### Component Creation
- Use functional components with hooks exclusively
- Each component should have a clearly defined single responsibility
- Always use TypeScript interfaces for component props

```tsx
// ✅ DO THIS: Well-defined props interface for barbershop features
interface ServiceCardProps {
  id: string;
  name: string;
  duration: number;
  price: number;
  categoryId: string;
  barberId?: string;
  onSelect: (serviceId: string) => void;
  isSelected?: boolean;
  isAvailable?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  duration,
  price,
  categoryId,
  barberId,
  onSelect,
  isSelected = false,
  isAvailable = true,
}) => {
  // Component implementation
};
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ServiceCard`, `BookingForm`, `BarberSchedule`)
- **Props Interfaces**: ComponentNameProps (e.g., `ServiceCardProps`, `BookingFormProps`)
- **Event Handlers**: handle[Event] (e.g., `handleBooking`, `handleServiceSelect`)
- **Custom Hooks**: use[Feature] (e.g., `useServices`, `useBookings`, `useBarbers`)
- **Utils/Helpers**: Descriptive verb-noun (e.g., `formatDuration`, `calculatePrice`)
- **Context**: [Feature]Context (e.g., `BookingContext`, `ServiceContext`)

## TypeScript Standards

### Type Safety
- **REQUIRED**: All components must have explicitly typed props
- **REQUIRED**: All functions must have return types
- **REQUIRED**: Avoid `any` type whenever possible
- **REQUIRED**: Use TypeScript interfaces for data structures
- Use type guards instead of type assertions when necessary
- Leverage union types for multi-state components

```tsx
// ✅ DO THIS: Properly typed function with return type for barbershop domain
const calculateServicePrice = (
  basePrice: number, 
  discountRate: number, 
  isPackage: boolean
): number => {
  const discountAmount = basePrice * discountRate;
  const finalPrice = basePrice - discountAmount;
  return isPackage ? finalPrice * 0.9 : finalPrice; // Package discount
};

// ❌ AVOID: Missing return type, parameters not typed
const calculateServicePrice = (basePrice, discountRate, isPackage) => {
  return basePrice - (basePrice * discountRate);
};
```

### Type Definitions
- Create dedicated type files for shared data structures (services, bookings, barbers)
- Export types from the component file if only used within that component
- Use Zod schemas for form validation and runtime type checking

## Styling Guidelines

### Tailwind Usage
- **REQUIRED**: Use Tailwind classes for ALL styling
- **REQUIRED**: No inline CSS or styled-components
- **REQUIRED**: No bare HTML elements without Tailwind classes
- Use the `cn()` utility for conditional classes
- Maintain a consistent ordering of Tailwind classes

```tsx
// ✅ DO THIS: Using Tailwind with cn() utility for barbershop UI
<button 
  className={cn(
    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
    "border border-primary/20 hover:border-primary/40",
    isSelected 
      ? "bg-primary text-primary-foreground shadow-md" 
      : "bg-background text-foreground hover:bg-accent/50",
    isUnavailable && "opacity-50 cursor-not-allowed"
  )}
  onClick={handleServiceSelect}
  disabled={isUnavailable}
>
  {children}
</button>

// ❌ AVOID: Using ternary operators directly in className
<button 
  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
    isSelected 
      ? "bg-primary text-primary-foreground" 
      : "bg-background text-foreground"
  }`}
  onClick={handleServiceSelect}
>
  {children}
</button>
```

### Class Organization
- Use logical grouping for Tailwind classes:
  1. Layout & Positioning (flex, grid, position)
  2. Sizing (width, height)
  3. Spacing (margin, padding)
  4. Typography (font, text)
  5. Visual (colors, borders, shadows)
  6. Interactive (hover, focus)

### Responsive Design
- Mobile-first approach is mandatory
- Use Tailwind breakpoint prefixes consistently
- Test all components across all defined breakpoints
- Ensure booking flow works seamlessly on mobile devices

## React Component Patterns

### Hooks Usage
- **REQUIRED**: Use function expressions with arrow syntax for hooks and handlers
- **REQUIRED**: Place hooks at the top of the component
- **REQUIRED**: Use custom hooks to extract complex logic
- **REQUIRED**: Name event handlers with "handle" prefix

```tsx
// ✅ DO THIS: Function expressions with const and proper naming for booking
const BookingForm: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const { services } = useServices();
  const { barbers } = useBarbers();
  
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
  };
  
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission
  };
  
  // Rest of component
};

// ❌ AVOID: Function declarations and inconsistent naming
function BookingForm() {
  const [selectedServices, setSelectedServices] = useState([]);
  
  function submitBooking(e) {
    e.preventDefault();
    // Handle submission
  }
  
  // Rest of component
}
```

### Component Organization
- Keep components focused on a single responsibility
- Extract reusable UI elements to separate components
- Use composition over inheritance
- Follow this order in component files:
  1. Imports
  2. Types/Interfaces
  3. Constants
  4. Component function
  5. Helper functions (if small and specific to the component)
  6. Export statement

## Performance Optimization

### Memoization
- Use React.memo for expensive renders (service lists, barber schedules)
- Use useCallback for functions passed as props
- Use useMemo for expensive calculations (price calculations, availability checks)
- Avoid premature optimization - only optimize when there's a performance issue

### Data Fetching
- Use React Query for all data fetching operations
- Implement proper loading states for all async operations
- Handle error states explicitly
- Use Suspense boundaries when appropriate
- Cache barber availability and service data appropriately

## Accessibility Requirements

### WCAG Compliance
- **REQUIRED**: All interactive elements must be keyboard accessible
- **REQUIRED**: All images must have alt text
- **REQUIRED**: Color contrast must meet WCAG AA standards
- **REQUIRED**: Focus states must be visible
- Use semantic HTML elements

```tsx
// ✅ DO THIS: Proper accessibility attributes for service selection
<button
  className="flex items-center gap-3 p-4 rounded-lg bg-card text-card-foreground border border-border hover:bg-accent"
  onClick={handleServiceSelect}
  aria-label={`Select ${serviceName} service, duration ${duration} minutes, price $${price}`}
  aria-pressed={isSelected}
  disabled={isUnavailable}
>
  <div className="flex-shrink-0">
    <ScissorsIcon className="h-5 w-5" aria-hidden="true" />
  </div>
  <div className="flex-1 text-left">
    <h3 className="font-medium">{serviceName}</h3>
    <p className="text-sm text-muted-foreground">{duration} min • ${price}</p>
  </div>
  {isSelected && (
    <CheckIcon className="h-5 w-5 text-primary" aria-hidden="true" />
  )}
</button>

// ❌ AVOID: Missing accessibility attributes
<div 
  className="flex items-center gap-3 p-4 rounded-lg bg-card"
  onClick={handleServiceSelect}
>
  <ScissorsIcon className="h-5 w-5" />
  <div>
    <h3>{serviceName}</h3>
    <p>{duration} min • ${price}</p>
  </div>
</div>
```

### Focus Management
- Ensure proper tab order in booking flows
- Use focus traps for modals and date pickers
- Return focus after modal close
- Handle keyboard navigation in custom components

## Error Handling

### Form Validation
- Use Zod for schema validation
- Provide clear error messages for booking forms
- Show inline validation errors
- Handle form submission errors gracefully

### API Error Handling
- Implement consistent error handling pattern
- Show user-friendly error messages for booking failures
- Log detailed errors for debugging
- Implement retry mechanisms where appropriate

## State Management

### Local State
- Use useState for component-level state (selected services, dates)
- Use useReducer for complex state logic (booking wizard steps)
- Keep state as close to where it's used as possible

### Global State
- Use Context API for shared state (current booking, user session)
- Consider Zustand for more complex state management
- Avoid prop drilling more than 2 levels deep

## File and Folder Organization

### Project Structure
- Group by feature first, then by type (booking/, admin/, customer/)
- Keep related files close together
- Follow established patterns for new features
- Maintain separation between customer-facing and admin components

### Import Organization
- Group imports in this order:
  1. React and React-related
  2. Third-party libraries
  3. Internal components/hooks/utils
  4. Types
  5. Assets

```tsx
// ✅ DO THIS: Organized imports for barbershop components
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/booking/service-selection/service-card";
import { useServices } from "@/hooks/service-selection/useServices";
import { formatDuration, formatPrice } from "@/utils/formatters";

import type { Service } from "@/types/supabase/domains/service";
import type { Booking } from "@/types/supabase/domains/booking";

// ❌ AVOID: Disorganized imports
import { formatPrice } from "@/utils/formatters";
import * as React from "react";
import type { Service } from "@/types/supabase/domains/service";
import { Button } from "@/components/ui/button";
import { useServices } from "@/hooks/service-selection/useServices";
import { useForm } from "react-hook-form";
import { ServiceCard } from "@/components/booking/service-selection/service-card";
import { zodResolver } from "@hookform/resolvers/zod";
```

## Code Review Checklist

Before submitting code for review, ensure:

1. All TypeScript types are properly defined
2. No console.logs left in the code
3. No TODO comments in production code
4. No unused variables or imports
5. All functions have return types
6. All components have prop types
7. All UI is responsive and mobile-friendly
8. All interactive elements are accessible
9. Error states are handled properly (booking failures, service unavailability)
10. The code follows naming conventions
11. The code is properly formatted
12. Tests pass (if applicable)
13. Booking flows work end-to-end
14. Admin functionality is properly secured

---

By following these standards consistently, we ensure a high-quality, maintainable codebase that delivers excellent user experience for both barbershop customers and staff using the Ekka Barbershop Management App. 
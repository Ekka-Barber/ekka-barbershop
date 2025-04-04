
# Code Organization Documentation

This documentation provides an overview of how the booking application code is organized, key patterns used, and how different components interact with each other.

## Architecture Overview

The booking application follows a component-based architecture with specialized hooks for business logic. The main patterns used include:

1. **Container/Presentation Pattern**: Separating business logic from UI rendering
2. **Custom Hooks Pattern**: Extracting reusable logic into specialized hooks
3. **Context Pattern**: Shared state management across components
4. **Service Pattern**: Core business operations are contained in service files

## Key Components and Hooks

### Booking Flow

The booking flow is managed through several key components and hooks:

1. **BookingContainer**: Top-level container managing overall booking state
2. **BookingStepManager**: Manages the multi-step booking process
3. **ServiceSelection**: Handles service selection with category filtering
4. **DateTimeSelection**: Manages date and time selection
5. **BarberSelection**: Handles barber selection and availability
6. **CustomerForm**: Captures customer details with validation

### Package & Discount System

The package discount system is implemented through specialized hooks and components:

1. **usePackageDiscount**: Core hook managing discount calculations
2. **PackageBanner**: Promotes package offerings to users
3. **PackageInfoDialog**: Educates users about package benefits
4. **PackageBuilderDialog**: Guides users through package creation

### Form Validation

Form validation is implemented using:

1. **useStepValidation**: Hook for validating booking steps
2. **useEnhancedFormValidation**: Hook for real-time field validation
3. **ValidationOverlay**: Component for displaying validation states
4. **Required Fields**: UI indicators in forms to guide users

## State Management

The application uses several patterns for state management:

1. **React Context**: For global state like language preferences
2. **Custom Hooks**: For domain-specific state like service selection
3. **Local State**: For component-specific UI states
4. **Props Drilling**: For passing state down to child components when appropriate

## Service Layer

The application uses service modules for core business operations:

1. **bookingService**: Handles data persistence and WhatsApp integration
2. **employeeScheduleService**: Manages employee availability and scheduling
3. **serviceCalculation**: Handles price and duration calculations

## Testing Strategy

The application includes several types of tests:

1. **Unit Tests**: For utility functions like `bookingCalculations`
2. **Integration Tests**: For testing component interactions
3. **Component Tests**: For testing individual UI components

## Error Handling

Error handling is implemented through:

1. **try/catch blocks**: In async operations
2. **Error boundaries**: For component-level error containment
3. **Validation overlays**: For user-friendly error display
4. **Logging service**: For recording errors for debugging

## Internationalization

The application supports multilingual interfaces through:

1. **LanguageContext**: For language preference management
2. **Translations**: Centralized translation strings
3. **RTL support**: For Arabic language support

## Key Functions and Their Purpose

| Function/Hook | Purpose |
|--------------|---------|
| `useBooking` | Top-level hook managing the booking state |
| `useServiceSelection` | Manages service selection logic |
| `calculateTotalPrice` | Calculates the total price for selected services |
| `handleServiceToggle` | Toggles service selection with proper discounts |
| `saveBookingData` | Persists booking data to the database |
| `createWhatsAppMessage` | Formats booking data for WhatsApp communication |
| `usePackageDiscount` | Calculates package discounts for service bundles |

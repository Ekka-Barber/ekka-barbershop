
# Project Architecture Documentation

## Overview

This booking application is designed as a modern single-page application (SPA) with a component-based architecture using React and TypeScript. The application is structured to support multiple languages, handle complex business logic for service booking, and provide a responsive user interface across different devices.

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Data Fetching**: Tanstack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui (Radix UI based)
- **Animations**: Framer Motion
- **Testing**: Jest and React Testing Library
- **Build Tool**: Vite

## Core Architecture Patterns

### 1. Component Composition

The UI is built through component composition, with a focus on building reusable, maintainable components that can be composed together to create complex interfaces.

### 2. Custom Hooks

Business logic is extracted into custom hooks to promote reusability and separation of concerns. This pattern makes testing easier and keeps components focused on rendering.

### 3. Context API

React Context is used for global state that needs to be accessed by many components (e.g., language preferences, booking state).

### 4. Services Pattern

Core business operations are encapsulated in service modules that handle data operations, external integrations, and complex calculations.

## Directory Structure

```
src/
├── assets/                   # Static assets
├── components/               # UI components
│   ├── booking/              # Booking flow components
│   │   ├── package/          # Package-related components
│   │   ├── service-selection/ # Service selection components
│   │   ├── steps/            # Step-based booking components
│   │   ├── summary/          # Booking summary components
│   │   └── upsell/           # Upsell components
│   ├── common/               # Shared components
│   ├── ui/                   # UI primitives (shadcn/ui)
├── contexts/                 # React contexts
├── hooks/                    # Custom React hooks
│   ├── service-selection/    # Service selection hooks
│   ├── steps/                # Booking step hooks
├── integrations/             # External service integrations
│   ├── supabase/             # Supabase integration
├── pages/                    # Top-level page components
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
│   ├── __tests__/            # Tests for utilities
├── docs/                     # Documentation
```

## Key Components

### Booking Flow

1. **BookingContainer**: The top-level component that manages the entire booking process.
2. **BookingStepManager**: Manages the multi-step booking flow with validation.
3. **ServiceSelection**: Allows users to browse and select services.
4. **DateTimeSelection**: Handles date and time selection.
5. **BarberSelection**: Handles staff member selection.
6. **CustomerForm**: Captures customer details.
7. **BookingSummary**: Shows a summary of the booking.

### Package System

The application includes a package system that allows users to bundle services together for discounts:

1. **PackageBanner**: Promotes package creation to users.
2. **PackageBuilderDialog**: Guides users through creating a package.
3. **PackageInfoDialog**: Educates users about package benefits.

### UI Components

The UI is built using shadcn/ui components with custom styling using Tailwind CSS. Key UI components include:

1. **ServiceCard**: Displays service information.
2. **BarberCard**: Displays barber information.
3. **TimeSlotPicker**: Allows selection of time slots.
4. **ValidationOverlay**: Shows validation status.

## State Management

State is managed through a combination of:

1. **Local Component State**: For UI-specific state.
2. **Custom Hooks**: For domain-specific state like service selection.
3. **React Context**: For global state like language preferences.
4. **React Query**: For server state management.

## Data Flow

1. **User Interactions**: User actions trigger state changes or API calls.
2. **Hook Logic**: Custom hooks process business logic.
3. **Component Updates**: React components re-render based on state changes.
4. **API Calls**: Services handle data persistence and retrieval.

## Error Handling

1. **Try/Catch Blocks**: For handling async operations.
2. **Error Boundaries**: For component-level error containment.
3. **Toast Notifications**: For user feedback.
4. **Logging**: For debugging and monitoring.

## Testing Strategy

1. **Unit Tests**: For utility functions and hooks.
2. **Component Tests**: For individual components.
3. **Integration Tests**: For component interactions.
4. **End-to-End Tests**: For critical user flows.

## Performance Optimizations

1. **Memoization**: Using useMemo and useCallback to prevent unnecessary re-renders.
2. **Code Splitting**: Loading components only when needed.
3. **Optimized Rendering**: Using React.memo for expensive components.
4. **Efficient State Updates**: Using functional updates for complex state.

## Security Considerations

1. **Input Validation**: Validating user inputs before submission.
2. **Authentication**: Using Supabase Auth for secure user authentication.
3. **Data Protection**: Ensuring sensitive data is properly handled.

## Integration Points

1. **Supabase**: For database operations and authentication.
2. **WhatsApp**: For booking confirmations.
3. **Date-fns**: For date manipulation.
4. **Mapbox**: For location services.

## Deployment

The application is deployed as a static website, with the backend services provided by Supabase. The deployment process includes:

1. **Build**: Vite builds the application.
2. **Deploy**: Static assets are deployed to a CDN.
3. **Database Migrations**: Applied to the Supabase database.

## Future Considerations

1. **Performance Monitoring**: Implementing monitoring tools.
2. **Accessibility Improvements**: Enhancing keyboard navigation and screen reader support.
3. **Progressive Web App**: Adding offline capabilities.
4. **Analytics**: Implementing detailed usage analytics.

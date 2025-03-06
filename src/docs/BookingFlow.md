
# Booking Flow Architecture

This document outlines the architecture and flow of the booking system.

## Overview

The booking system follows a multi-step process that guides users through selecting services, choosing dates/times, selecting staff, and entering personal details.

```
Services Selection → Date Selection → Barber Selection → Time Selection → Customer Details → Confirmation
```

## Core Components

### Data Flow

```
╔═══════════════╗      ╔════════════════╗      ╔════════════════╗
║ BookingContext ║ ←→  ║   useBooking   ║ ←→  ║ Service Hooks   ║
╚═══════════════╝      ╚════════════════╝      ╚════════════════╝
        ↑                       ↑                      ↑
        ↓                       ↓                      ↓
╔═══════════════╗      ╔════════════════╗      ╔════════════════╗
║ Booking Steps ║ ←→  ║ Step Components ║ ←→  ║   UI Elements  ║
╚═══════════════╝      ╚════════════════╝      ╚════════════════╝
```

### Key Components

1. **BookingContext**: Central state management for the booking process
2. **useBooking Hook**: Core logic for the booking workflow
3. **Step Components**: Individual UI components for each step
4. **Service Hooks**: Specialized hooks for services, package discounts, etc.

## Package Discount System

The package discount system applies tiered discounts based on the number of services added:

```
╔═════════════════╗      ╔═══════════════════════╗
║ Base Service    ║ ─→   ║ No discount on base   ║
╚═════════════════╝      ╚═══════════════════════╝
        ↓
╔═════════════════╗      ╔═══════════════════════╗
║ +1 Add-on       ║ ─→   ║ Tier 1 discount (15%) ║
╚═════════════════╝      ╚═══════════════════════╝
        ↓
╔═════════════════╗      ╔═══════════════════════╗
║ +2 Add-ons      ║ ─→   ║ Tier 2 discount (20%) ║
╚═════════════════╝      ╚═══════════════════════╝
        ↓
╔═════════════════╗      ╔═══════════════════════╗
║ 3+ Add-ons      ║ ─→   ║ Tier 3 discount (25%) ║
╚═════════════════╝      ╚═══════════════════════╝
```

## Edge Cases

- **Time Slots After Midnight**: Special handling for slots that cross to the next day
- **Service Duration Overlap**: Checks to ensure sufficient time between bookings
- **Package Discount Recalculation**: Automatic recalculation when services are added/removed
- **Multiple Language Support**: All UI elements support Arabic and English with RTL adjustments

## Technical Implementation

The implementation follows a clean architecture pattern:

1. **Presentation Layer**: React components and UI elements
2. **Business Logic Layer**: React hooks, context, and service utilities
3. **Data Layer**: API hooks and data fetching utilities

## Future Improvements

- Implement caching for API data to improve performance
- Add offline support for better mobile experience
- Expand test coverage, especially for edge cases

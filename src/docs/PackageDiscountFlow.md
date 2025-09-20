
# Package Discount System Flow

## Overview

The package discount system allows customers to receive increasing discounts as they add more services to their booking. This document outlines the flow and key decision points in the package discount system.

## Flow Diagram

```
┌─────────────────┐
│ Begin Selection │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     No     ┌──────────────────┐
│ Is Base Service │────────────►│ Regular Booking  │
│    Selected?    │            │  (No Discounts)  │
└────────┬────────┘            └──────────────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Package Enabled │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     0      ┌──────────────────┐
│  Number of      │────────────►│ Base Price Only  │
│  Add-on Services│            │   (No Discount)  │
└────────┬────────┘            └──────────────────┘
         │ ≥ 1
         ▼
┌─────────────────┐
│Apply Appropriate│
│ Discount Tier   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Recalculate    │
│  Total Price    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Yes    ┌──────────────────┐
│ More Services   │────────────►│ Update Discount  │
│    Added?       │            │      Tier        │
└────────┬────────┘            └────────┬─────────┘
         │ No                           │
         ▼                              │
┌─────────────────┐                     │
│  Finalize       │◄────────────────────┘
│  Package Price  │
└─────────────────┘
```

## Discount Tier Calculation

| Add-on Services | Discount % | Applied To          |
|-----------------|------------|---------------------|
| 0               | 0%         | N/A                 |
| 1               | 15%        | Add-on service only |
| 2               | 20%        | Add-on services only|
| 3+              | 25%        | Add-on services only|

## Key Decision Points

1. **Base Service Detection**: The system first checks if the customer has selected the designated base service.
2. **Add-on Counting**: The system counts how many eligible add-on services have been selected.
3. **Tier Selection**: The appropriate discount tier is selected based on the count.
4. **Price Recalculation**: All prices are recalculated whenever services are added or removed.
5. **UI Updates**: The UI shows current discount tier and potential savings for the next tier.

## Edge Cases

- **Adding Services Late**: If a customer adds the base service after selecting other services, the system needs to reconfigure properly.
- **Removing Base Service**: If a customer removes the base service, the package discount is disabled.
- **Threshold Transitions**: When crossing tier thresholds, animations highlight the increased discount.

## Implementation Details

The main components involved in this flow are:
- `usePackageDiscount` hook: Manages discount business logic
- `usePackageCalculation` hook: Performs price calculations
- `PackageSummary` component: Displays current pricing and savings
- `ServiceSelection` component: Handles service selection with package awareness

# Salary Formula Builder

This module implements a flexible, configurable formula-based salary calculation system for the barbershop management application. The system allows admins to create custom salary formulas with variables, operations, and steps.

## Key Components

### Types

- `FormulaPlan`: Defines the structure of a formula plan, including variables, steps, and output
- `FormulaStep`: Represents a single calculation step in the formula
- `FormulaOperator`: Defines available operations (add, subtract, etc.)
- `FormulaVariable`: Defines input variables and their properties

### Utilities

- `FormulaValidator`: Validates formula plans for correctness and potential issues
- `FormulaEvaluator`: Evaluates formula plans with given data (optimized with memoization)

### API Services

- `FormulaPlanService`: API service for CRUD operations on formula plans
- `useFormulaPlanApi`: React hook for interacting with the API in components

### UI Components

- `ResponsiveFormulaPlanBuilder`: Main formula builder component
- `DraggableStepList`: Drag-and-drop step management
- `FormulaPlanFlowchart`: Visual representation of the formula
- `FormulaPlanPreview`: Simulation and preview of formula results

## Phase 6 Implementation: API Integration & Performance

This phase focuses on integrating the formula builder with the backend API, improving performance, and adding comprehensive testing.

### API Integration

We've implemented:

1. API service (`FormulaPlanService`) with endpoints for:
   - Saving/loading formulas
   - Managing formula templates
   - Version management for formulas

2. React hook (`useFormulaPlanApi`) for:
   - Loading/saving plans
   - Template management
   - Version history

3. UI enhancements:
   - Save dialog with name and description
   - Template selection interface
   - Version history and restore functionality

### Performance Optimization

Formula evaluation has been optimized with:

1. Memoization of operation results to avoid redundant calculations
2. Efficient caching strategy using unique keys
3. Performance metrics to measure execution time

### Testing

Comprehensive tests cover:

1. Formula validation:
   - Testing valid formulas
   - Testing for circular dependencies
   - Testing for missing variables

2. Formula evaluation:
   - Basic operation tests
   - Conditional logic tests
   - Error handling (e.g., division by zero)
   - Memoization effectiveness

## Usage

### Creating a Formula Plan

```typescript
// Example: Creating a basic commission formula
const plan: FormulaPlan = {
  variables: [
    {
      name: 'baseSalary',
      description: 'Base salary amount',
      defaultValue: 1000,
      source: 'constant'
    },
    {
      name: 'sales',
      description: 'Total sales amount',
      defaultValue: 0,
      source: 'employee'
    },
    {
      name: 'commissionRate',
      description: 'Commission percentage',
      defaultValue: 10,
      source: 'constant'
    }
  ],
  steps: [
    {
      id: 'step1', 
      name: 'Calculate commission',
      operation: {
        type: 'multiply',
        parameters: ['sales', {
          type: 'divide',
          parameters: ['commissionRate', 100]
        }]
      },
      result: 'commission'
    },
    {
      id: 'step2',
      name: 'Calculate total salary',
      operation: {
        type: 'add',
        parameters: ['baseSalary', 'commission']
      },
      result: 'totalSalary'
    }
  ],
  outputVariable: 'totalSalary'
};
```

### Saving a Formula Plan

```typescript
const { savePlan } = useFormulaPlanApi();

// Save the plan
const savedPlan = await savePlan(
  formulaPlan,
  'Commission-based Salary',
  'Base salary plus commission based on sales'
);
```

### Loading and Using Templates

```typescript
const { templates, loadTemplates } = useFormulaPlanApi();

// Load available templates
useEffect(() => {
  loadTemplates();
}, []);

// Use a template as starting point
const handleLoadTemplate = (template) => {
  // Create a new plan from the template
  setFormulaPlan({
    ...template,
    id: undefined, // Create as new
    name: `${template.name} (Copy)`,
  });
};
```

### Evaluating a Formula

```typescript
// Sample data for evaluation
const sampleData = {
  baseSalary: 2000,
  sales: 10000,
  commissionRate: 15
};

// Evaluate the formula
const result = FormulaEvaluator.evaluateFormula(plan, sampleData);

// Access the final result
console.log(`Total Salary: ${result.finalResult}`);

// Access individual step results
result.steps.forEach(step => {
  console.log(`${step.stepName}: ${step.result}`);
});
```

## Next Steps

Future enhancements could include:

- Enhanced templating system with categories
- Formula import/export functionality
- More advanced operations and functions
- Data visualization of formula results
- Formula approval workflows 

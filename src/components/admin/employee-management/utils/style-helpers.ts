/**
 * Style Consistency Utilities
 * 
 * This file contains utilities to help maintain consistent styling
 * between original and new components during the restructuring process.
 */

/**
 * Ensures that Tailwind classes from original components are exactly matched
 * in new components. This helps maintain visual consistency during restructuring.
 * 
 * @param originalClasses - The original Tailwind classes from the source component
 * @param overrideClasses - Optional classes to override or add to the original set
 * @returns A string of combined Tailwind classes
 */
export const matchTailwindClasses = (
  originalClasses: string,
  overrideClasses?: string
): string => {
  // If no overrides, return original untouched
  if (!overrideClasses) return originalClasses;

  // Split classes into arrays
  const originalClassArray = originalClasses.split(' ').filter(c => c.trim());
  const overrideClassArray = overrideClasses.split(' ').filter(c => c.trim());
  
  // Create a map for efficient lookup
  const classMap = new Map<string, string>();
  
  // Add all original classes to the map
  // The key is the class name prefix (before any colon or dash)
  originalClassArray.forEach(cls => {
    const prefix = cls.split(':')[0].split('-')[0];
    classMap.set(prefix, cls);
  });
  
  // Override with new classes
  overrideClassArray.forEach(cls => {
    const prefix = cls.split(':')[0].split('-')[0];
    classMap.set(prefix, cls);
  });
  
  // Convert map back to string
  return Array.from(classMap.values()).join(' ');
};

/**
 * Standard component class libraries for consistent styling
 */
export const standardClasses = {
  card: "bg-white rounded-lg shadow-md p-4 border border-gray-200",
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md",
    danger: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
  },
  input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  select: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  label: "block text-sm font-medium text-gray-700 mb-1",
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  tabButton: "px-4 py-2 font-medium text-sm focus:outline-none",
  activeTab: "border-b-2 border-blue-500 text-blue-600",
  inactiveTab: "text-gray-500 hover:text-gray-700"
};

/**
 * Adds responsive classes to ensure consistent styling across breakpoints
 */
export const withResponsive = (baseClasses: string): string => {
  return `${baseClasses} sm:text-sm md:text-base lg:text-base`;
}; 
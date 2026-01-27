
/**
 * Role styling constants for employee roles
 * Used for consistent icons, colors, and styling across the application
 */

export const roleIcons: Record<string, string> = {
  manager: "👔",
  barber: "✂️",
  receptionist: "🎯",
  cleaner: "🧹",
  massage_therapist: "💆‍♂️",
  hammam_specialist: "🧖‍♂️"
};

export const roleColors: Record<string, string> = {
  manager: "border-blue-300 hover:border-blue-400 bg-gradient-to-br from-blue-50 via-white to-blue-50",
  barber: "border-green-300 hover:border-green-400 bg-gradient-to-br from-green-50 via-white to-green-50",
  receptionist: "border-purple-300 hover:border-purple-400 bg-gradient-to-br from-purple-50 via-white to-purple-50",
  cleaner: "border-gray-300 hover:border-gray-400 bg-gradient-to-br from-gray-50 via-white to-gray-50",
  massage_therapist: "border-pink-300 hover:border-pink-400 bg-gradient-to-br from-pink-50 via-white to-pink-50",
  hammam_specialist: "border-yellow-300 hover:border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-yellow-50"
};

export const roleGradients: Record<string, string> = {
  manager: "from-blue-500/10 via-blue-100/5 to-transparent",
  barber: "from-green-500/10 via-green-100/5 to-transparent",
  receptionist: "from-purple-500/10 via-purple-100/5 to-transparent",
  cleaner: "from-gray-500/10 via-gray-100/5 to-transparent",
  massage_therapist: "from-pink-500/10 via-pink-100/5 to-transparent",
  hammam_specialist: "from-yellow-500/10 via-yellow-100/5 to-transparent"
};

export const roleBorderColors: Record<string, string> = {
  manager: "border-blue-300",
  barber: "border-green-300",
  receptionist: "border-purple-300",
  cleaner: "border-gray-300",
  massage_therapist: "border-pink-300",
  hammam_specialist: "border-yellow-300"
};

export const roleTextColors: Record<string, string> = {
  manager: "text-blue-600",
  barber: "text-green-600",
  receptionist: "text-purple-600",
  cleaner: "text-gray-600",
  massage_therapist: "text-pink-600",
  hammam_specialist: "text-yellow-600"
};

export const roleBackgroundColors: Record<string, string> = {
  manager: "bg-blue-50",
  barber: "bg-green-50",
  receptionist: "bg-purple-50",
  cleaner: "bg-gray-50",
  massage_therapist: "bg-pink-50",
  hammam_specialist: "bg-yellow-50"
};

// Role badges for filtering options
export const roleBadgeColors: Record<string, string> = {
  manager: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  barber: "bg-green-100 text-green-800 hover:bg-green-200",
  receptionist: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  cleaner: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  massage_therapist: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  hammam_specialist: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
};

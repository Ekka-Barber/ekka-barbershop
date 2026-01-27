import React from 'react';

interface EmployeeAvatarProps {
  employeeName: string;
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  employeeName,
}): JSX.Element => {
  // Extract initials from employee name
  const getInitials = (name: string): string => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
        {getInitials(employeeName)}
      </div>
    </div>
  );
};


import { User } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

import { roleIcons, roleTextColors, roleBackgroundColors } from "@shared/constants/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/ui/components/avatar";
import { countryToCode, codeToCountry } from "@shared/utils/countryMapping";

interface EmployeeInfoProps {
  name: string;
  name_ar?: string;
  role: string;
  photo_url?: string;
  nationality?: string;
}

export const EmployeeInfo = ({ name, name_ar, role, photo_url, nationality }: EmployeeInfoProps) => {
  const getCountryDisplayName = (nationality?: string) => {
    if (!nationality) return null;
    return codeToCountry[nationality] || nationality;
  };

  return (
    <div className="flex items-center gap-6 mb-5 relative">
      <div className="relative">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg transition-all duration-300 hover:scale-105 z-10">
           <AvatarImage src={photo_url} name={name} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md z-20 border-2 border-white animate-pulse-soft">
          <span className="text-lg" title={role}>{roleIcons[role]}</span>
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-2xl mb-1 text-gray-800 font-changa group-hover:text-gray-900 transition-colors">
          {name_ar || name}
        </h3>
        {name_ar && <p className="text-sm text-gray-500 mb-2">{name}</p>}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className={`text-sm px-3 py-1 rounded-full inline-flex items-center ${roleBackgroundColors[role]} ${roleTextColors[role]} border border-opacity-50`} title={role}>
            <span className="capitalize">
              {role.replace('_', ' ')}
            </span>
          </span>
          
          {nationality && countryToCode[nationality] && (
            <span className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm inline-flex items-center text-sm text-gray-600">
              <ReactCountryFlag 
                countryCode={countryToCode[nationality]} 
                svg 
                style={{
                  width: '1.2em',
                  height: '1.2em',
                  marginRight: '0.5rem'
                }} 
              />
              <span>
                {getCountryDisplayName(nationality) || nationality}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

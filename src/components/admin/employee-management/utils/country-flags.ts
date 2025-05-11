interface CountryMapping {
  [key: string]: string;
}

export const countryToISOMapping: CountryMapping = {
  'Saudi Arabia': 'SA',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'Egypt': 'EG',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'India': 'IN',
  'Pakistan': 'PK',
  'Philippines': 'PH',
  'Bangladesh': 'BD',
  'Nepal': 'NP',
  'Sri Lanka': 'LK',
  // Add more mappings as needed
};

export const getCountryCode = (country: string): string => {
  if (!country) return '';
  return countryToISOMapping[country] || '';
};

export const getFlagUrl = (countryCode: string): string => {
  if (!countryCode) return '';
  // Use a flag API or local images
  return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
}; 
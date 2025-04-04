export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // This is just a minimal mock to make TypeScript happy
      // The actual generated types would be much more comprehensive
    };
    Enums: {
      // Enum types would be defined here
    };
  };
}

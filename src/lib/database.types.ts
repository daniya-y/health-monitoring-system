export interface Database {
  public: {
    Tables: {
      health_data: {
        Row: {
          id: string;
          student_id: string;
          heart_rate: number;  // Changed from integer to numeric
          spo2: number;        // Changed from integer to numeric
          body_temperature: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          heart_rate: number;  // Changed from integer to numeric
          spo2: number;        // Changed from integer to numeric
          body_temperature: number;
          created_at?: string;
        };
      };
    };
  };
}
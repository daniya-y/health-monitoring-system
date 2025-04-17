export interface Database {
  public: {
    Tables: {
      health_data: {
        Row: {
          id: string;
          student_id: string;
          heart_rate: number;
          spo2: number;
          body_temperature: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          heart_rate: number;
          spo2: number;
          body_temperature: number;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          student_id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          name: string;
          email: string;
          created_at?: string;
        };
      };
    };
  };
}
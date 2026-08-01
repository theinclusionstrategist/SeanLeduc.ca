export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'archived'
  | string;

export interface Lead {
  id: string;
  session_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  status: LeadStatus;
  intent_tags?: string[] | null;
  notes?: string | null;
  last_active: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at'>;
        Update: Partial<Lead>;
      };
    };
  };
}

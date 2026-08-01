export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'CONVERTED'
  | 'DISQUALIFIED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | string;

export interface Lead {
  id: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  stage?: string;
  agent?: string;
  agent_id?: string;
  source?: string;
  notes?: string;
  intent_tags?: string[];
  session_id?: string;
  last_active?: string;
  priority?: string;
  nba?: string;
  market?: string;
  type?: string;
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

export type TrackType = 'Recruit' | 'Client' | 'Potential Referral Partner';
export type PriorityLevel = 'SUPER HOT' | 'Hot' | 'Warm' | 'Luke Warm' | 'Cold';
export type AgentName = 'Sean' | 'Shaun' | 'ALL';

export interface Contact {
  id: string;
  name: string;
  type: TrackType;
  stage: string;
  phone: string | null;
  email: string | null;
  market: string | null;
  score: string | null;
  agent: string;
  priority: PriorityLevel;
  qr_scanned: boolean | string;
  log: boolean | string;
  note: boolean | string;
  ep_attended: boolean | string;
  created_at: string;
  updated_at: string;
  last_contact: string | null;
  nba: string | null;
  next_date: string | null;
  tags: string | null;
  link: string | null;
  notes: string | null;
}

export interface CRMFilterState {
  track: TrackType;
  agent: AgentName;
  query: string;
  stageFilter: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
  error?: string;
}

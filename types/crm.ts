export type TrackType = 'Recruit' | 'Client' | 'ALL';
export type AgentName = 'ALL' | 'Sean' | 'Shaun';

export interface Contact {
  id: string | number;
  ID?: string;
  name: string;
  type: string;
  stage: string;
  phone?: string;
  email?: string;
  market?: string;
  score?: number;
  agent?: string;
  agent_id?: string;
  priority?: string;
  nba?: string;
  NBA?: string;
  link?: string;
  Link?: string;
  Doc?: string;
  notes?: string;
  Notes?: string;
  created_at?: string;
  Updated?: string;
  'last contact'?: string;
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

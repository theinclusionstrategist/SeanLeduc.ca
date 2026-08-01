export type EntityPillar = 'WFG Financial' | 'Motivational Speaking' | 'UNITE Charity';

export type WfgSubTrack = 'Recruit' | 'Business Services' | 'Personal Advisory';

export type TrackType = 'Recruit' | 'Client' | 'ALL';
export type AgentName = 'ALL' | 'Sean' | 'Shaun';

export interface Contact {
  id: string | number;
  ID?: string;
  name: string;
  type: string; // 'Recruit' | 'Client'
  stage: string;
  entity_pillar?: EntityPillar; // 'WFG Financial' | 'Motivational Speaking' | 'UNITE Charity'
  sub_track?: WfgSubTrack; // 'Recruit' | 'Business Services' | 'Personal Advisory'
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
  last_contacted?: string;
  'last contact'?: string;
  nurture_active?: boolean;
  nurture_step?: number;
  next_nurture_date?: string;
  created_at?: string;
  Updated?: string;
}

export interface CRMFilterState {
  track: TrackType;
  agent: AgentName;
  entityPillar?: EntityPillar | 'ALL';
  subTrack?: WfgSubTrack | 'ALL';
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

export type ImpactEvidenceType =
  | 'live'
  | 'repository'
  | 'image'
  | 'video'
  | 'diagram'
  | 'pull_request'
  | 'report'
  | 'testimonial'
  | 'analytics'
  | 'document';

export type ImpactWorkType =
  | 'client_work'
  | 'company_work'
  | 'independent_case_study'
  | 'open_source'
  | 'public_build'
  | 'free_community_tool';

export type ImpactVisibility = 'confidential' | 'client_approved' | 'public';
export type ImpactEvidenceLevel = 'measured' | 'client_reported' | 'enabled' | 'proposed';
export type ImpactStatus = 'draft' | 'in_development' | 'completed' | 'archived';

export type ImpactStory = {
  slug: string;
  title: string;
  summary: string;
  businessContext: string;
  originalRequest: string;
  discoveredProblem: string;
  recommendation: string;
  solution: string;
  systemFlow?: string[];
  decisions?: string[];
  capabilityEnabled: string;
  outcome?: string;
  outcomeEvidence: ImpactEvidenceLevel;
  workType: ImpactWorkType;
  visibility: ImpactVisibility;
  status: ImpactStatus;
  technologies: string[];
  evidence: Array<{
    type: ImpactEvidenceType;
    label: string;
    href?: string;
    asset?: string;
    approvedForPublic: boolean;
  }>;
  lessons?: string[];
  nextImprovements?: string[];
  published: boolean;
};

// Add a story only when the facts and public evidence are ready.
// The public listing and detail route intentionally ignore unpublished entries.
export const impactStories: ImpactStory[] = [];

export const publicImpactStories = impactStories.filter((story) => story.published);

export const impactWorkTypeLabels: Record<ImpactWorkType, string> = {
  client_work: 'Client Work',
  company_work: 'Company Work',
  independent_case_study: 'Independent Case Study',
  open_source: 'Open Source',
  public_build: 'Public Build',
  free_community_tool: 'Free Community Tool',
};

export const impactVisibilityLabels: Record<ImpactVisibility, string> = {
  confidential: 'Confidential',
  client_approved: 'Client-approved',
  public: 'Public',
};

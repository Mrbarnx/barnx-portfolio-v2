import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { publicImpactStories, type ImpactStory } from '@/data/impact';
import { getSupabaseConfig, hasSupabaseConfig } from '@/lib/supabase/config';

export const getPublishedImpactStories = cache(async (): Promise<ImpactStory[]> => {
  if (!hasSupabaseConfig()) return publicImpactStories;
  try {
    const { url, anonKey } = getSupabaseConfig();
    const db = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: stories, error } = await db.from('impact_stories').select('*').eq('published', true).neq('visibility', 'confidential').neq('status', 'archived').order('featured', { ascending: false }).order('sort_order');
    if (error) throw error;
    if (!stories?.length) return publicImpactStories;
    const ids = stories.map((story) => story.id);
    const { data: evidence } = await db.from('impact_evidence').select('impact_story_id,evidence_type,label,href,approved_for_public').in('impact_story_id', ids).eq('approved_for_public', true).order('sort_order');
    return stories.map((row) => ({
      slug: row.slug, title: row.title, summary: row.summary, businessContext: row.business_context,
      originalRequest: row.original_request, discoveredProblem: row.discovered_problem, recommendation: row.recommendation,
      solution: row.solution, systemFlow: row.system_flow, decisions: row.decisions, capabilityEnabled: row.capability_enabled,
      outcome: row.outcome ?? undefined, outcomeEvidence: row.outcome_evidence, workType: row.work_type,
      visibility: row.visibility, status: row.status, technologies: row.technologies, lessons: row.lessons,
      nextImprovements: row.next_improvements, published: true,
      evidence: (evidence ?? []).filter((item) => item.impact_story_id === row.id).map((item) => ({ type: item.evidence_type, label: item.label, href: item.href ?? undefined, approvedForPublic: true })),
    })) as ImpactStory[];
  } catch { return publicImpactStories; }
});

export const getPublishedImpactStory = cache(async (slug: string) => (await getPublishedImpactStories()).find((story) => story.slug === slug) ?? null);

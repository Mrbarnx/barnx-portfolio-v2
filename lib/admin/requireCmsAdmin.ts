import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireCmsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: isAdmin, error } = await supabase.rpc('is_cms_admin');

  if (error || !isAdmin) {
    await supabase.auth.signOut();
    redirect('/admin/login');
  }

  return { supabase, user };
}

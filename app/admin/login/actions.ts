'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email address and password.' };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

  if (signInError) {
    return { error: 'The email or password is incorrect.' };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_cms_admin');

  if (adminError || !isAdmin) {
    await supabase.auth.signOut();
    return { error: 'This account is not authorized to access Barnx Admin.' };
  }

  redirect('/admin');
}

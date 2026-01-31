import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function HomePage() {
  const userData = await getCurrentUser();

  // If not authenticated, redirect to marketing
  if (!userData) {
    redirect('/marketing');
  }

  const { profile } = userData;

  // Redirect based on role
  if (profile?.role === 'tenant') {
    redirect('/tenant/dashboard');
  } else if (profile?.role === 'landlord') {
    redirect('/landlord/dashboard');
  } else if (profile?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  // Fallback to marketing if no role found
  redirect('/marketing');
}

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { AppNavbar } from './components/app-navbar';
import { AIChatWidget } from '@/components/ai/ai-chat-widget';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getCurrentUser();

  if (!userData) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar user={userData.user} profile={userData.profile} />
      <main>{children}</main>
      <AIChatWidget />
    </div>
  );
}

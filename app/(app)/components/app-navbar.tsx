'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';
import { Home, Building2, Users, LogOut } from 'lucide-react';

interface AppNavbarProps {
  user: User;
  profile: Profile | null;
}

export function AppNavbar({ user, profile }: AppNavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/marketing');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">
                Choozify
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {profile?.role === 'tenant' && (
                <>
                  <Link
                    href="/tenant/dashboard"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/properties"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Propiedades
                  </Link>
                </>
              )}

              {profile?.role === 'landlord' && (
                <>
                  <Link
                    href="/landlord/dashboard"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/properties"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Mis Propiedades
                  </Link>
                  <Link
                    href="/landlord/applications"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Aplicaciones
                  </Link>
                </>
              )}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-brand-500 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-600">
              {profile?.full_name || user.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

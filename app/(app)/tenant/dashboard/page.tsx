import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/properties/property-card';
import { Property } from '@/types/database';

export default async function TenantDashboardPage() {
  const userData = await getCurrentUser();

  if (!userData || userData.profile?.role !== 'tenant') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch eligible properties (simplified for now)
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .limit(6);

  // Fetch tenant's applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*, properties(*)')
    .eq('tenant_id', userData.user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {userData.profile?.full_name || 'Arrendatario'}
        </h1>
        <p className="text-gray-600">Encuentra tu próximo hogar con nuestra ayuda de IA</p>
      </div>

      {/* Profile completion status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Estado del Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-600"
                  style={{
                    width: `${
                      ([
                        userData.profile?.income,
                        userData.profile?.score,
                        userData.profile?.employment_type,
                        userData.profile?.preferences_json?.preferred_zone_names?.length,
                      ].filter(Boolean).length /
                        4) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <Badge variant="secondary">
              {Math.round(
                ([
                  userData.profile?.income,
                  userData.profile?.score,
                  userData.profile?.employment_type,
                  userData.profile?.preferences_json?.preferred_zone_names?.length,
                ].filter(Boolean).length /
                  4) *
                  100
              )}
              % Completo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* My Applications */}
      {applications && applications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mis Aplicaciones ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((application: any) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{application.properties?.zone_name}</p>
                    <p className="text-sm text-gray-600">
                      ${application.properties?.details_json?.price}/mes
                    </p>
                  </div>
                  <Badge variant={application.status === 'accepted' ? 'default' : 'secondary'}>
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Properties */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Propiedades Recomendadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}

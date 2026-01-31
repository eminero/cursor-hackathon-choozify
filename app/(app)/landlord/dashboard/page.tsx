import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users } from 'lucide-react';
import Link from 'next/link';

export default async function LandlordDashboardPage() {
  const userData = await getCurrentUser();

  if (!userData || userData.profile?.role !== 'landlord') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch landlord's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('landlord_id', userData.user.id);

  // Fetch all applications to landlord's properties
  const { data: applications } = await supabase
    .from('applications')
    .select('*, properties!inner(landlord_id), profiles(*)')
    .eq('properties.landlord_id', userData.user.id);

  const activeProperties = properties?.filter((p) => p.status === 'active').length || 0;
  const pendingApplications = applications?.filter((a) => a.status === 'submitted').length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard del Arrendador</h1>
          <p className="text-gray-600">Gestiona tus propiedades y aplicaciones</p>
        </div>
        <div className="flex gap-3">
          <Link href="/landlord/applications">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Ver Aplicaciones
            </Button>
          </Link>
          <Button className="bg-gradient-to-r from-brand-500 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Propiedades Activas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Propiedades</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties?.length || 0}</div>
          </CardContent>
        </Card>
        <Link href="/landlord/applications">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aplicaciones Pendientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-brand-600 mt-1">Click para ver detalles →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* My Properties */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mis Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property: any) => {
                const propertyApplications = applications?.filter(
                  (a) => a.property_id === property.id
                );
                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-brand-500 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{property.zone_name}</p>
                      <p className="text-sm text-gray-600">
                        ${property.details_json?.price}/mes • {property.details_json?.bedrooms}{' '}
                        habitaciones
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {propertyApplications && propertyApplications.length > 0 && (
                        <Badge variant="secondary">
                          {propertyApplications.length} aplicaciones
                        </Badge>
                      )}
                      <Badge variant={property.status === 'active' ? 'default' : 'outline'}>
                        {property.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No tienes propiedades registradas</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      {applications && applications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aplicaciones Recientes</CardTitle>
            <Link href="/landlord/applications">
              <Button variant="ghost" size="sm" className="text-brand-600">
                Ver todas →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((application: any) => (
                <Link
                  key={application.id}
                  href={`/landlord/applications/${application.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-medium">
                      {application.profiles?.full_name || application.profiles?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Aplicó a propiedad en {application.properties?.zone_name}
                    </p>
                  </div>
                  <Badge variant={application.status === 'accepted' ? 'default' : 'secondary'}>
                    {application.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

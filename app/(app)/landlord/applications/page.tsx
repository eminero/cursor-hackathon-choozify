import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Briefcase, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import type { Application, Profile, Property } from '@/types/database';

interface ApplicationWithDetails extends Application {
  profiles: Profile;
  properties: Property;
}

export default async function LandlordApplicationsPage() {
  const userData = await getCurrentUser();

  if (!userData || userData.profile?.role !== 'landlord') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch all applications to landlord's properties with tenant and property details
  const { data: applications, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      profiles!applications_tenant_id_fkey(*),
      properties!applications_property_id_fkey(*)
    `
    )
    .eq('properties.landlord_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
  }

  const typedApplications = applications as unknown as ApplicationWithDetails[];

  const statusColors = {
    submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    reviewing: 'bg-blue-100 text-blue-800 border-blue-300',
    accepted: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusLabels = {
    submitted: 'Pendiente',
    reviewing: 'En revisión',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
  };

  // Group applications by status
  const pendingApplications = typedApplications?.filter((a) => a.status === 'submitted') || [];
  const reviewingApplications = typedApplications?.filter((a) => a.status === 'reviewing') || [];
  const acceptedApplications = typedApplications?.filter((a) => a.status === 'accepted') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Aplicaciones</h1>
        <p className="text-gray-600">
          Revisa y gestiona las aplicaciones de arrendatarios a tus propiedades
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">{pendingApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren tu atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">{reviewingApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewingApplications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">En proceso de evaluación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
            <Badge className="bg-green-100 text-green-800">{acceptedApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedApplications.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Arrendatarios aprobados</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      {typedApplications && typedApplications.length > 0 ? (
        <div className="space-y-6">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {pendingApplications.length}
                  </Badge>
                  Aplicaciones Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/landlord/applications/${application.id}`}
                      className="block p-6 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {application.profiles?.full_name || 'Arrendatario'}
                            </h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Mail className="w-4 h-4" />
                            {application.profiles?.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            Propiedad en {application.properties?.zone_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(application.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Tenant Preview Info */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Ingreso</p>
                            <p className="font-semibold">
                              ${application.profiles?.income?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Score</p>
                            <p className="font-semibold">{application.profiles?.score || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Empleo</p>
                            <p className="font-semibold text-sm">
                              {application.profiles?.employment_type?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviewing Applications */}
          {reviewingApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {reviewingApplications.length}
                  </Badge>
                  En Revisión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewingApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/landlord/applications/${application.id}`}
                      className="block p-6 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {application.profiles?.full_name || 'Arrendatario'}
                            </h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            Propiedad en {application.properties?.zone_name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accepted Applications */}
          {acceptedApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {acceptedApplications.length}
                  </Badge>
                  Aplicaciones Aceptadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acceptedApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/landlord/applications/${application.id}`}
                      className="block p-6 border rounded-lg hover:border-brand-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {application.profiles?.full_name || 'Arrendatario'}
                            </h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            Propiedad en {application.properties?.zone_name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No hay aplicaciones todavía</p>
              <p className="text-sm">
                Las aplicaciones de arrendatarios aparecerán aquí cuando alguien aplique a tus
                propiedades.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Star,
  MapPin,
  Check,
  X,
  ChevronLeft,
  Home,
  Users,
  Car,
  Cigarette,
  PawPrint,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import type { Application, Profile, Property } from '@/types/database';
import { ApplicationActions } from './application-actions';

interface ApplicationWithDetails extends Application {
  profiles: Profile;
  properties: Property;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const userData = await getCurrentUser();

  if (!userData || userData.profile?.role !== 'landlord') {
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch application with tenant and property details
  const { data: application, error } = await supabase
    .from('applications')
    .select(
      `
      *,
      profiles!applications_tenant_id_fkey(*),
      properties!applications_property_id_fkey(*)
    `
    )
    .eq('id', id)
    .single();

  if (error || !application) {
    console.error('Error fetching application:', error);
    notFound();
  }

  const typedApplication = application as unknown as ApplicationWithDetails;

  // Verify landlord owns the property
  if (typedApplication.properties?.landlord_id !== userData.user.id) {
    redirect('/landlord/applications');
  }

  const tenant = typedApplication.profiles;
  const property = typedApplication.properties;
  const preferences = tenant.preferences_json || {};
  const propertyDetails = property.details_json;
  const propertyCriteria = property.criteria_json;

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

  // Check eligibility
  const meetsIncome = tenant.income ? tenant.income >= propertyCriteria.min_income : false;
  const meetsScore = tenant.score ? tenant.score >= propertyCriteria.min_score : false;
  const meetsEmployment =
    propertyCriteria.employment_types_allowed === 'any' ||
    (Array.isArray(propertyCriteria.employment_types_allowed) &&
      tenant.employment_type &&
      propertyCriteria.employment_types_allowed.includes(tenant.employment_type));
  const meetsPets = !preferences.has_pets || propertyCriteria.pets_allowed;
  const meetsSmoking = !preferences.smokes || propertyCriteria.smoking_allowed;
  const meetsParking = !preferences.needs_parking || propertyDetails.has_parking;

  const isEligible =
    meetsIncome && meetsScore && meetsEmployment && meetsPets && meetsSmoking && meetsParking;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/landlord/applications"
          className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a aplicaciones
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {tenant.full_name || 'Arrendatario'}
              </h1>
              <Badge className={statusColors[typedApplication.status]}>
                {statusLabels[typedApplication.status]}
              </Badge>
            </div>
            <p className="text-gray-600">
              Aplicación recibida el{' '}
              {new Date(typedApplication.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <ApplicationActions
            applicationId={typedApplication.id}
            currentStatus={typedApplication.status}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Tenant Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility Status */}
          <Card
            className={isEligible ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isEligible ? (
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-100 rounded-full">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {isEligible ? 'Cumple todos los requisitos' : 'No cumple algunos requisitos'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEligible
                      ? 'Este arrendatario cumple con todos los criterios de elegibilidad de la propiedad.'
                      : 'Este arrendatario no cumple con algunos de los requisitos de la propiedad.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{tenant.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Ingreso Mensual</p>
                    <p className="text-2xl font-bold">
                      ${tenant.income?.toLocaleString() || 'N/A'}
                    </p>
                    <div className="mt-2">
                      {meetsIncome ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          Cumple requisito (${propertyCriteria.min_income?.toLocaleString()})
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <X className="w-4 h-4" />
                          No cumple requisito (${propertyCriteria.min_income?.toLocaleString()})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Star className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Score Crediticio</p>
                    <p className="text-2xl font-bold">{tenant.score || 'N/A'}</p>
                    <div className="mt-2">
                      {meetsScore ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          Cumple requisito (mín. {propertyCriteria.min_score})
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <X className="w-4 h-4" />
                          No cumple requisito (mín. {propertyCriteria.min_score})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Briefcase className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Tipo de Empleo</p>
                  <p className="font-semibold capitalize">
                    {tenant.employment_type?.replace('_', ' ') || 'No especificado'}
                  </p>
                  <div className="mt-2">
                    {meetsEmployment ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        Tipo de empleo permitido
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <X className="w-4 h-4" />
                        Tipo de empleo no permitido
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental History / Records */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Renta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">Estado de Historial</p>
                    <p className="text-xs text-gray-600 mt-1">
                      El historial de renta detallado estará disponible cuando el arrendatario
                      complete su perfil.
                    </p>
                  </div>
                  <Badge variant="secondary">En desarrollo</Badge>
                </div>
                <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium mb-1">📋 Próximamente:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Historial de pagos puntuales</li>
                    <li>Propiedades previas rentadas</li>
                    <li>Referencias de arrendadores anteriores</li>
                    <li>Reporte de comportamiento como arrendatario</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias y Estilo de Vida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <PawPrint className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Mascotas</p>
                    <p className="font-semibold">
                      {preferences.has_pets ? 'Tiene mascotas' : 'No tiene mascotas'}
                    </p>
                    {preferences.has_pets && (
                      <div className="mt-2">
                        {meetsPets ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Propiedad permite mascotas
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <X className="w-4 h-4" />
                            Propiedad no permite mascotas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Cigarette className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Fumador</p>
                    <p className="font-semibold">{preferences.smokes ? 'Sí fuma' : 'No fuma'}</p>
                    {preferences.smokes && (
                      <div className="mt-2">
                        {meetsSmoking ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Propiedad permite fumar
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <X className="w-4 h-4" />
                            Propiedad no permite fumar
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Car className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Estacionamiento</p>
                    <p className="font-semibold">
                      {preferences.needs_parking ? 'Requiere estacionamiento' : 'No requiere'}
                    </p>
                    {preferences.needs_parking && (
                      <div className="mt-2">
                        {meetsParking ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Propiedad tiene estacionamiento
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <X className="w-4 h-4" />
                            Propiedad no tiene estacionamiento
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Zonas de Preferencia</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.preferred_zone_names &&
                      preferences.preferred_zone_names.length > 0 ? (
                        preferences.preferred_zone_names.map((zone: string) => (
                          <Badge key={zone} variant="secondary" className="text-xs">
                            {zone}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No especificadas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Property Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Propiedad Aplicada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/properties/${property.id}`}
                className="block hover:opacity-80 transition-opacity"
              >
                {property.images_json && property.images_json.length > 0 ? (
                  <img
                    src={property.images_json[0].url}
                    alt={property.zone_name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </Link>

              <div>
                <h3 className="font-semibold text-lg">{property.zone_name}</h3>
                <p className="text-gray-600">{propertyDetails.address}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio mensual:</span>
                  <span className="font-semibold">${propertyDetails.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Habitaciones:</span>
                  <span className="font-semibold">{propertyDetails.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estacionamiento:</span>
                  <span className="font-semibold">{propertyDetails.has_parking ? 'Sí' : 'No'}</span>
                </div>
              </div>

              <Link
                href={`/properties/${property.id}`}
                className="block w-full text-center py-2 px-4 border border-brand-500 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
              >
                Ver detalles de la propiedad
              </Link>
            </CardContent>
          </Card>

          {/* Visit Scheduling */}
          {typedApplication.status === 'accepted' && typedApplication.visit_scheduled_at && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Visita Programada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Fecha y hora:</p>
                <p className="font-semibold">
                  {new Date(typedApplication.visit_scheduled_at).toLocaleString('es-ES', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

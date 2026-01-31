import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, DollarSign, Car } from 'lucide-react';
import { ApplyButton } from './apply-button';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userData = await getCurrentUser();

  if (!userData) {
    redirect('/auth/sign-in');
  }

  const supabase = await createClient();

  // Fetch property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, profiles(full_name, email)')
    .eq('id', parseInt(id))
    .single();

  if (error || !property) {
    notFound();
  }

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('*')
    .eq('property_id', property.id)
    .eq('tenant_id', userData.user.id)
    .single();

  const images = property.images_json || [];
  const fallbackImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop';
  const mainImage = images[0] || { url: fallbackImage, alt: property.zone_name };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative h-96 w-full rounded-lg overflow-hidden">
            <Image src={mainImage.url} alt={mainImage.alt} fill className="object-cover" priority />
          </div>
          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {images.slice(1).map((image: { url: string; alt: string }, index: number) => (
                <div key={index} className="relative h-24 w-full rounded-lg overflow-hidden">
                  <Image src={image.url} alt={image.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              <span className="text-gray-600">{property.zone_name}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ${property.details_json.price}
              <span className="text-2xl text-gray-600">/mes</span>
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">
                <Bed className="w-4 h-4 mr-1" />
                {property.details_json.bedrooms} habitaciones
              </Badge>
              {property.details_json.has_parking && (
                <Badge variant="outline">
                  <Car className="w-4 h-4 mr-1" />
                  Parqueo
                </Badge>
              )}
            </div>
            <p className="text-gray-700">{property.details_json.address}</p>
          </div>

          {/* Apply button for tenants */}
          {userData.profile?.role === 'tenant' && (
            <div>
              {existingApplication ? (
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
                  <p className="text-brand-700 font-medium">Ya has aplicado a esta propiedad</p>
                  <p className="text-sm text-brand-600">Estado: {existingApplication.status}</p>
                </div>
              ) : (
                <ApplyButton propertyId={property.id} />
              )}
            </div>
          )}

          {/* Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ingreso mínimo:</span>
                <span className="font-medium">${property.criteria_json.min_income}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Score mínimo:</span>
                <span className="font-medium">{property.criteria_json.min_score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mascotas:</span>
                <Badge variant={property.criteria_json.pets_allowed ? 'default' : 'outline'}>
                  {property.criteria_json.pets_allowed ? 'Permitidas' : 'No permitidas'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fumadores:</span>
                <Badge variant={property.criteria_json.smoking_allowed ? 'default' : 'outline'}>
                  {property.criteria_json.smoking_allowed ? 'Permitido' : 'No permitido'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Landlord info */}
          <Card>
            <CardHeader>
              <CardTitle>Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 font-medium">
                {property.profiles?.full_name || 'Propietario'}
              </p>
              <p className="text-sm text-gray-600">{property.profiles?.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

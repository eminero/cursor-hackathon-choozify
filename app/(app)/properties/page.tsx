import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PropertyCard } from '@/components/properties/property-card';
import type { Property } from '@/types/database';

export default async function PropertiesPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    redirect('/auth/sign-in');
  }

  const supabase = await createClient();

  // Fetch properties based on user role
  let query = supabase.from('properties').select('*');

  if (userData.profile?.role === 'landlord') {
    // Landlords see only their properties
    query = query.eq('landlord_id', userData.user.id);
  } else {
    // Tenants see active properties
    query = query.eq('status', 'active');
  }

  const { data: properties } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {userData.profile?.role === 'landlord' ? 'Mis Propiedades' : 'Propiedades Disponibles'}
        </h1>
        <p className="text-gray-600">{properties?.length || 0} propiedades encontradas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property: Property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {(!properties || properties.length === 0) && (
        <div className="text-center py-12 text-gray-500">No se encontraron propiedades</div>
      )}
    </div>
  );
}

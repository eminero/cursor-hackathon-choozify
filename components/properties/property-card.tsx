import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed } from 'lucide-react';
import { Property } from '@/types/database';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const firstImage = property.images_json?.[0];
  const fallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop';

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={firstImage?.url || fallbackImage}
            alt={firstImage?.alt || property.zone_name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-white text-gray-900">
              {property.status === 'active' ? 'Disponible' : 'No disponible'}
            </Badge>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.zone_name}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">
            ${property.details_json.price}/mes
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.details_json.bedrooms} hab</span>
            </div>
            {property.details_json.has_parking && (
              <Badge variant="outline" className="text-xs">
                Parqueo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

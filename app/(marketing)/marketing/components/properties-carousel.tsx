'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const properties = [
  {
    id: 1,
    title: 'Casa Frente al Mar',
    location: 'Puerto de La Libertad',
    price: '$450/mes',
    details: '3 habitaciones • 2 baños • 120 m²',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Apartamento con Vista al Océano',
    location: 'Puerto de La Libertad',
    price: '$350/mes',
    details: '2 habitaciones • 1 baño • 75 m²',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Villa de Lujo',
    location: 'La Escalón, San Salvador',
    price: '$800/mes',
    details: '4 habitaciones • 3 baños • 200 m²',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Casa Moderna con Jardín',
    location: 'La Escalón, San Salvador',
    price: '$600/mes',
    details: '3 habitaciones • 2 baños • 150 m²',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Propiedad Tipo Resort',
    location: 'Santa Elena, Cuscatlán',
    price: '$550/mes',
    details: '3 habitaciones • 2 baños • 140 m²',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Cabaña Ecológica',
    location: 'Santa Elena, Cuscatlán',
    price: '$250/mes',
    details: '2 habitaciones • 1 baño • 60 m²',
    image: 'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800&h=600&fit=crop&q=80',
  },
];

export function PropertiesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % properties.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % properties.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + properties.length) % properties.length);
  };

  return (
    <section id="properties" className="pt-16 py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Propiedades Destacadas en El Salvador
          </h2>
          <p className="text-xl text-gray-600">
            Descubre las mejores opciones disponibles en las zonas más exclusivas
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative h-[500px]">
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-bold mb-2">{property.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                    <p className="text-xl mb-4">{property.details}</p>
                    <p className="text-2xl font-bold">{property.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="flex justify-center gap-2 mt-6">
            {properties.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-brand-500 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

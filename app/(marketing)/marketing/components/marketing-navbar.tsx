'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarketingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">
              Choozify
            </h1>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#properties"
              className="text-gray-700 hover:text-brand-500 transition-colors font-medium"
            >
              Propiedades
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-brand-500 transition-colors font-medium"
            >
              Características
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-brand-500 transition-colors font-medium"
            >
              Cómo Funciona
            </a>
            <Button
              asChild
              className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700"
            >
              <a href="#contact">Contacto</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-brand-500"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a
              href="#properties"
              className="block py-2 text-gray-700 hover:text-brand-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Propiedades
            </a>
            <a
              href="#features"
              className="block py-2 text-gray-700 hover:text-brand-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Características
            </a>
            <a
              href="#how-it-works"
              className="block py-2 text-gray-700 hover:text-brand-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Cómo Funciona
            </a>
            <a
              href="#contact"
              className="block py-2 text-gray-700 hover:text-brand-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

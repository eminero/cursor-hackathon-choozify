import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Encuentra tu hogar ideal en{' '}
            <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">
              El Salvador
            </span>{' '}
            con{' '}
            <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">
              Inteligencia Artificial
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Choozify conecta arrendadores y arrendatarios de manera inteligente, usando IA para
            hacer coincidir propiedades perfectas con inquilinos ideales en las mejores zonas del
            país.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-lg px-8"
            >
              Descubre más
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

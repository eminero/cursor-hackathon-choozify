import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-500 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para revolucionar el mercado inmobiliario?
        </h2>
        <p className="text-xl mb-10 opacity-90">
          Únete a Choozify y experimenta el futuro de la búsqueda de propiedades
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="text-lg px-8 bg-white text-brand-600 hover:bg-gray-100"
        >
          Comenzar ahora
        </Button>
      </div>
    </section>
  );
}

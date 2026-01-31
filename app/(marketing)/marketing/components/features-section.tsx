import { Bot, Target, MapPin, BarChart3, User, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Bot,
    title: 'Asistente IA',
    description:
      'Chatbot inteligente que entiende búsquedas en lenguaje natural. Di "Necesito un depa de 2 cuartos en Providencia por menos de $800" y encuentra resultados instantáneamente.',
  },
  {
    icon: Target,
    title: 'Coincidencias Inteligentes',
    description:
      'Sistema de matching que conecta propiedades con inquilinos ideales basado en criterios específicos como ingresos, puntuación crediticia y preferencias.',
  },
  {
    icon: MapPin,
    title: 'Expansión Geo-Inteligente',
    description:
      'Recibe notificaciones de oportunidades cercanas a tu zona preferida, incluso si están fuera de tu área exacta pero dentro de un radio configurable.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard para Arrendadores',
    description:
      'Los propietarios pueden ver solicitantes que cumplen sus criterios, revisar aplicaciones y programar visitas de manera eficiente.',
  },
  {
    icon: User,
    title: 'Perfiles Completos',
    description:
      'Los arrendatarios pueden crear perfiles detallados con datos personales, ingresos y zonas preferidas para obtener mejores coincidencias.',
  },
  {
    icon: Bell,
    title: 'Notificaciones Inteligentes',
    description:
      'Sistema de alertas que te notifica cuando hay coincidencias exactas o oportunidades cercanas a tu zona preferida.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Características Principales
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-2 hover:border-brand-500 transition-all hover:shadow-lg"
            >
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

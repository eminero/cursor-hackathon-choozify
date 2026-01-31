import { Card, CardContent } from '@/components/ui/card';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo Funciona</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden border-2 hover:border-brand-500 transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-purple-600" />
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Para Arrendadores</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Sube tu propiedad con criterios específicos
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Visualiza solicitantes que cumplen tus requisitos
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Revisa y acepta aplicaciones
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Programa visitas directamente
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-brand-500 transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-purple-600" />
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Para Arrendatarios</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Crea tu perfil con datos e ingresos
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Define tus zonas preferidas
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Usa el chatbot IA para búsquedas naturales
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Recibe notificaciones de propiedades ideales
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-brand-500 transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-purple-600" />
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">IA al Rescate</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Búsqueda conversacional en lenguaje natural
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Matching automático de criterios
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Expansión geográfica inteligente
                </li>
                <li className="flex items-start">
                  <span className="text-brand-500 mr-2">•</span>
                  Notificaciones contextuales
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

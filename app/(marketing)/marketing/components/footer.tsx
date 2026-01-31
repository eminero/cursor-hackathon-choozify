export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Choozify
            </h3>
            <p className="text-gray-400">
              Marketplace inteligente que conecta arrendadores y arrendatarios con tecnología de IA.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Proyecto</h4>
            <p className="text-gray-400">Desarrollado para Hackathon</p>
            <p className="text-gray-400">MVP - RentalMatch AI-Powered</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <p className="text-gray-400">Para más información sobre el proyecto</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Choozify. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

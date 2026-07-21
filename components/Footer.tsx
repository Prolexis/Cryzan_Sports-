export function Footer() {
  return (
    <footer className="bg-black text-gray-400 border-t border-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h3 className="text-white font-extrabold text-lg tracking-wider">CRY ZAN SPORT</h3>
          <p className="text-sm mt-1 text-gray-500">
            Ropa, calzado y accesorios deportivos de la más alta calidad en Trujillo, Perú.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Cryzan Sport Perú | Todos los derechos reservados.</p>
          <p className="mt-1">Trujillo - Perú | Atencion: +51 999 888 777</p>
        </div>
      </div>
    </footer>
  );
}

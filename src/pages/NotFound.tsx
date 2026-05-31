import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Página no encontrada | SimSmile";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "La página que buscas no existe. Vuelve al simulador de sonrisa SimSmile by Clínica Miró.");
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `https://simsmile.lovable.app${location.pathname}`);
    logger.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404 — Página no encontrada</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! La página que buscas no existe.</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;


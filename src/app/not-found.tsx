import React from "react";
import Link from "next/link";
import {
  Database,
  Home,
  FileSearch,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Database className="h-24 w-24 text-blue-600 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              !
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Pero no te preocupes, aún tenemos muchas otras páginas para explorar.
        </p>

        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Página Principal</h3>
            <p className="text-sm text-gray-600">
              Vuelve al inicio y descubre nuestras soluciones
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <FileSearch className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Documentación</h3>
            <p className="text-sm text-gray-600">
              Explora nuestra guía de usuario
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Soporte</h3>
            <p className="text-sm text-gray-600">Contacta con nuestro equipo</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

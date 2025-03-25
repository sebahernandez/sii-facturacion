import React from "react";
import { Receipt, Shield, Cloud, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Facturación Electrónica",
  description: "Plataforma de facturación electrónica simple y eficiente",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Facturación Electrónica
              <span className="text-blue-600 block">
                Simple,Eficiente y GRATIS!
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simplifica tu proceso de facturación con nuestra plataforma
              integrada directamente con Servicios de Impuestos Internos
            </p>
            <div className="flex justify-center gap-4">
              <Link
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                href="/auth/register"
              >
                Registrar ahora
              </Link>
              <Link
                href="/auth/login"
                className="border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para tu facturación
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nuestra plataforma ofrece todas las herramientas necesarias para
            gestionar tu facturación de manera eficiente y segura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Facturación Instantánea
            </h3>
            <p className="text-gray-600">
              Genera y envía facturas electrónicas en segundos, cumpliendo con
              todos los requisitos legales.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Validación SII</h3>
            <p className="text-gray-600">
              Conexión directa con Servicios de Impuestos Internos para
              validación en tiempo real.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Almacenamiento Seguro
            </h3>
            <p className="text-gray-600">
              Todos tus documentos almacenados de forma segura en la nube y
              disponibles cuando los necesites.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beneficios para tu empresa
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Ahorro de tiempo</h3>
                <p className="text-gray-600">
                  Automatiza el proceso de facturación y reduce el tiempo
                  dedicado a tareas administrativas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Cumplimiento legal
                </h3>
                <p className="text-gray-600">
                  Mantén tu empresa al día con todas las regulaciones fiscales
                  vigentes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Reducción de errores
                </h3>
                <p className="text-gray-600">
                  Sistema inteligente que minimiza errores en la emisión de
                  documentos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Soporte especializado
                </h3>
                <p className="text-gray-600">
                  Equipo de expertos disponible para ayudarte en cada paso del
                  proceso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a facturar electrónicamente hoy
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de empresas que ya confían en nuestra plataforma para
            su facturación electrónica
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-flex items-center gap-2"
          >
            Empezar Ahora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

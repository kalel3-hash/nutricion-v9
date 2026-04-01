"use client";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <Image
          src="/Logo.png"
          alt="VitalCross AI"
          width={600}
          height={220}
          className="object-contain mb-6"
        />
        <p className="text-gray-500 text-base mb-10 leading-relaxed">
          Tu análisis nutricional personalizado basado en tu perfil de salud
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/register"
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg text-center hover:bg-green-700 transition-colors shadow-sm"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="w-full bg-white text-green-700 py-4 rounded-2xl font-semibold text-lg text-center hover:bg-green-50 transition-colors border-2 border-green-600"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          Analizá alimentos según tu perfil clínico real.
          Colesterol, glucemia, medicamentos y más.
        </p>
      </div>
    </div>
  );
}
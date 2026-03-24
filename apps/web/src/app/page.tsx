export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-600 shadow-md">
          <span className="text-3xl font-extrabold tracking-tight text-white">N9</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Nutrición V9
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600 sm:text-lg">
          Tu análisis nutricional personalizado basado en tu perfil de salud
        </p>

        <button
          type="button"
          className="mt-10 inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          Comenzar
        </button>

        <p className="mt-4 text-sm text-gray-500">¿Ya tenés cuenta? Iniciar sesión</p>
      </div>
    </main>
  );
}

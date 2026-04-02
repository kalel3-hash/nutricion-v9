// apps/web/src/app/login/page.tsx
import Image from "next/image";
import { signIn } from "@/auth"; // v5: server action
import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl || "/";

  async function googleSignIn() {
    "use server";
    // Inicia sesión con Google y redirige a la URL solicitada o a "/"
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <main className="min-h-[80vh] grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white shadow p-8 space-y-8">
        <div className="flex flex-col items-center gap-3">
          {/* Logo opcional */}
          <Image
            src="/logo.png"
            alt="VitalCross AI"
            width={120}
            height={120}
            priority
          />
          <h1 className="text-2xl font-semibold text-center">Iniciar sesión</h1>
          <p className="text-sm text-neutral-600 text-center">
            Accedé con tu cuenta de Google
          </p>
        </div>

        <form action={googleSignIn} className="space-y-4">
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303C33.807 31.657 29.314 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.817C14.651 16.018 18.961 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 43c5.241 0 9.735-1.737 12.98-4.712l-5.99-4.998C29.9 34.669 27.17 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303C34.617 31.657 30.124 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43c8.837 0 16-7.163 16-16 0-1.341-.138-2.651-.389-3.917z"
              />
            </svg>
            Continuar con Google
          </button>
        </form>

        {/* Enlace de fallback si las server actions estuvieran bloqueadas */}
        <div className="text-center">
          <a
            href={`/api/auth/signin?provider=google&callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Problemas? Probar inicio con enlace directo
          </a>
        </div>
      </div>
    </main>
  );
}
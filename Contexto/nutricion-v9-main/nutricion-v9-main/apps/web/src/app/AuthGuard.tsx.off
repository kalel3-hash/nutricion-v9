"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [supabase, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}

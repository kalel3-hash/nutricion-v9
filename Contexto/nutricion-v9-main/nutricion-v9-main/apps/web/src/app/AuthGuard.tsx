"use client";

import React from "react";

/**
 * AuthGuard NO-OP (desactivado)
 * - No usa supabase.auth.getSession()
 * - No redirige a /login desde el cliente
 * La protección real se hace en server con NextAuth (layout de (protected)).
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  // Log en la terminal (útil si más adelante llega code/state reales)
  console.log("[/auth/callback] GET query:", query);

  // HOME
  return NextResponse.redirect(new URL("/", url));
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  console.log("[/auth/callback] POST recibido");

  // HOME
  return NextResponse.redirect(new URL("/", url));
}
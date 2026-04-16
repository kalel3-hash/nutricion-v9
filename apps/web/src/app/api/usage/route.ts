import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUsageStatus } from "@/lib/usage";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const usageStatus = await getUsageStatus(email);

    return NextResponse.json(usageStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener límites de uso" },
      { status: 500 }
    );
  }
}
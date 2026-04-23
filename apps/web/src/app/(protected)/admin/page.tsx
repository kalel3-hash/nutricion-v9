import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const baseUrl =
    process.env.NEXTAUTH_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: {
      cookie: `next-auth.session-token=${session}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  return <AdminClient users={data.users || []} summary={data.summary || {}} />;
}
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<{
    users: any[];
    summary: any;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/admin/stats")
        .then(res => {
          if (res.status === 401) {
            router.replace("/login");
            return null;
          }
          if (res.status === 403) {
            router.replace("/dashboard");
            return null;
          }
          return res.json();
        })
        .then(json => {
          if (json) setData(json);
        })
        .catch(() => router.replace("/dashboard"));
    }
  }, [status]);

  if (!data) return null;

  return <AdminClient users={data.users} summary={data.summary} />;
}
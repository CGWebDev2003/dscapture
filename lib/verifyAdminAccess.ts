"use client";

import { supabase } from "@/lib/supabaseClient";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Hook zum clientseitigen Prüfen des Admin-Zugriffs.
 * 
 * Wird beim Aufruf automatisch ausgeführt und leitet um, 
 * falls kein gültiger Admin gefunden wird.
 */
export function useVerifyAdminAccess() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const userId = Cookies.get("userId");

      if (!userId) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("adminUsers")
        .select("email, role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data || data.role !== "admin") {
        console.warn("Admin-Überprüfung fehlgeschlagen:", error ?? data);
        router.replace("/login");
        return;
      }

      setAdminUser({ email: data.email, role: data.role });
      setLoading(false);
    }

    checkAccess();
  }, [router]);

  return { loading, adminUser };
}

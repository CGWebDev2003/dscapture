import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyAdminAccess() {
  // 1️⃣ Cookie auslesen
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  // 2️⃣ Supabase Client (anon key reicht)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3️⃣ Abfrage: existiert der User in adminUsers?
  const { data: adminUser, error } = await supabase
    .from("adminUsers")
    .select("role, email")
    .eq("user_id", userId)
    .maybeSingle();

  // 4️⃣ Prüfung auf Existenz & Rolle
  if (error) {
    console.error("Fehler bei der Admin-Abfrage:", error);
    redirect("/login");
  }

  if (!adminUser) {
    console.warn("Kein Admin-Eintrag für diesen User gefunden");
    redirect("/login");
  }

  if (adminUser.role !== "admin") {
    console.warn(`Unzureichende Berechtigung: Rolle ist '${adminUser.role}'`);
    redirect("/login");
  }

  // 5️⃣ Rückgabe bei Erfolg
  return {
    userId,
    role: adminUser.role,
    email: adminUser.email,
  };
}

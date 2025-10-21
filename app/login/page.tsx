"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login fehlgeschlagen: " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      Cookies.set("userId", data.user.id, { expires: 7 });

      const { data: adminUser, error: clientError } = await supabase
        .from("adminUsers")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle(); // ✅ gibt kein Error, wenn kein Datensatz gefunden wird

      if (clientError) {
        console.error("Fehler beim Laden der Client-Daten:", clientError.message);
      }

      if (!adminUser) {
        console.warn("Kein Admin-Eintrag für diesen Benutzer gefunden.");
      }

      if (adminUser?.role) {
        Cookies.set("role", adminUser.role, { expires: 7 });
      }

      // await logActivity(
      //   "User Login",
      //   { step: 0 },
      //   {
      //     userId: data.user.id,
      //     action: "login",
      //     entityType: "client",
      //     entityId: data.user.id,
      //     details: { success: true },
      //     userAgent: navigator.userAgent,
      //   }
      // );

      router.push("/admin");
    }

    setLoading(false);
  }

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <h1>Einloggen</h1>

        <div className="inputBox">
          <span className="inputIconBox">
            <i className="bi bi-envelope inputIcon"></i>
          </span>
          <input
            type="email"
            placeholder="Email"
            className="customInput"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
          <input
            type="password"
            placeholder="Passwort"
            className="customInput"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? "Einloggen..." : <>Einloggen <i className="bi bi-arrow-right"></i></>}
        </button>
      </form>
    </div>
  );
}

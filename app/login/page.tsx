// "use client";

// import { useState } from "react";
// import { supabase } from "../../lib/supabaseClint";
// import { useRouter } from "next/navigation";
// import styles from "./page.module.css";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setError(error.message);
//       return;
//     }

//     router.push("/admin"); // Weiterleitung nach Login
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white">
//       <form onSubmit={handleLogin} className="space-y-4 w-80">
//         <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
//         <input
//           type="email"
//           placeholder="E-Mail"
//           className="w-full rounded-lg bg-neutral-900 p-3"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Passwort"
//           className="w-full rounded-lg bg-neutral-900 p-3"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         {error && <p className="text-red-400 text-sm">{error}</p>}
//         <button
//           type="submit"
//           className="w-full bg-white text-black py-2 rounded-lg font-medium"
//         >
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }




"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClint";
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

      const { data: client, error: clientError } = await supabase
        .from("users")
        .select("role")
        .eq("userId", data.user.id)
        .single();

      if (clientError) {
        console.error("Fehler beim Laden der Client-Daten:", clientError);
      }

      if (client?.role) {
        Cookies.set("role", client.role, { expires: 7 });
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

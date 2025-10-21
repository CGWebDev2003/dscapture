"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClint";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin"); // Weiterleitung nach Login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="space-y-4 w-80">
        <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
        <input
          type="email"
          placeholder="E-Mail"
          className="w-full rounded-lg bg-neutral-900 p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          className="w-full rounded-lg bg-neutral-900 p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded-lg font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
}

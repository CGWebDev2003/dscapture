"use client";

import { useVerifyAdminAccess } from "../../lib/verifyAdminAccess";
import LogoutButton from "@/components/logoutButton/LogoutButton";
import styles from "./page.module.css";

export default function AdminPage() {
  // 👇 führt clientseitig den Zugriffsschutz aus
  const { loading, adminUser } = useVerifyAdminAccess();

  if (loading) {
    return <div className={styles.adminContent}>Überprüfung läuft...</div>;
  }

  return (
    <div className={styles.adminContent}>
      <h1>Adminbereich</h1>
      <p>Willkommen, {adminUser?.email}</p>
      <p>Rolle: {adminUser?.role}</p>

      <LogoutButton />
    </div>
  );
}

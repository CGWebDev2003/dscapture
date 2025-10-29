"use client";

import Link from "next/link";
import AdminSidebar from "../adminComponents/adminSidebar/AdminSidebar";
import styles from "../page.module.css";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import blogStyles from "./page.module.css";
import "../adminComponents/adminPageHader.css";

export default function BlogManager() {
  const { loading } = useVerifyAdminAccess();

  if (loading) {
    return <div className={styles.adminContent}>Überprüfung läuft...</div>;
  }

  return (
    <div className={styles.adminPage}>
      <AdminSidebar />
      <div className={`${styles.adminContent} ${blogStyles.blogContent}`}>
        <header className="adminPageHeader">
          <h1>Blog Manager</h1>
          <Link className={blogStyles.newBlogButton} href="/admin/blog/neuer-artikel">
            <i className="bi bi-plus-circle"></i> Neuer Artikel
          </Link>
        </header>
      </div>
    </div>
  );
}

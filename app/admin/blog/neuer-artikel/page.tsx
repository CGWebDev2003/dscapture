"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import layoutStyles from "../../page.module.css";
import AdminSidebar from "../../adminComponents/adminSidebar/AdminSidebar";
import styles from "./page.module.css";
import "../../adminComponents/adminPageHader.css";
import Cookies from "js-cookie";

export default function BlogCreatePage() {
  const { loading: verifying } = useVerifyAdminAccess();
  const userId = Cookies.get("userId");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9äöüß ]/gi, "")
        .replace(/\s+/g, "-")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("posts").insert([
      {
        author_id: userId,
        title,
        slug,
        excerpt,
        content,
        cover_image: coverImage || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      },
    ]);

    if (error) {
      alert("Fehler beim Erstellen des Artikels: " + error.message);
      setLoading(false);
      return;
    }

    alert("Artikel erfolgreich erstellt!");
    router.push("/admin/blog");
  }

  if (verifying) {
    return <div className={layoutStyles.adminContent}>Überprüfung läuft...</div>;
  }

  return (
    <div className={layoutStyles.adminPage}>
      <AdminSidebar />
      <div className={`${layoutStyles.adminContent} ${styles.blogContent}`}>
        <header className="adminPageHeader">
          <h1>Neuer Artikel</h1>
          <Link className={styles.abortButton} href="/admin/blog">
            <i className="bi bi-x-circle"></i> Abbrechen
          </Link>
        </header>

        <form onSubmit={handleSubmit} className={styles.blogForm}>
          <label>
            Titel
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </label>

          <label>
            Slug
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </label>

          <label>
            Auszug
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Kurze Beschreibung oder Teasertext..."
            />
          </label>

          <label>
            Inhalt
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Hier den Artikel schreiben..."
              required
            />
          </label>

          <label>
            Cover Image URL
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
            </select>
          </label>

          <button type="submit" disabled={loading} className="primaryButton">
            {loading ? "Speichere..." : "Artikel erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}

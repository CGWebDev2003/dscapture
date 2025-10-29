"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../adminComponents/adminSidebar/AdminSidebar";
import styles from "../page.module.css";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import blogStyles from "./page.module.css";
import "../adminComponents/adminPageHader.css";
import { supabase } from "@/lib/supabaseClient";

interface BlogPostPreview {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

export default function BlogManager() {
  const { loading } = useVerifyAdminAccess();
  const [posts, setPosts] = useState<BlogPostPreview[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    let isMounted = true;

    async function loadPosts() {
      setFetchingPosts(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Fehler beim Laden der veröffentlichten Artikel:", error);
        setFetchError("Die veröffentlichten Artikel konnten nicht geladen werden.");
        setPosts([]);
      } else {
        setPosts(data ?? []);
      }

      setFetchingPosts(false);
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [loading]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

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

        <section className={blogStyles.blogSection}>
          <h2>Veröffentlichte Artikel</h2>

          {fetchingPosts && <p>Lade veröffentlichte Artikel...</p>}

          {!fetchingPosts && fetchError && <p className={blogStyles.errorText}>{fetchError}</p>}

          {!fetchingPosts && !fetchError && posts.length === 0 && (
            <p className={blogStyles.emptyState}>Es wurden noch keine Artikel veröffentlicht.</p>
          )}

          {!fetchingPosts && !fetchError && posts.length > 0 && (
            <div className={blogStyles.blogGrid}>
              {posts.map((post) => (
                <article key={post.id} className={blogStyles.blogCard}>
                  <div
                    className={blogStyles.blogCardImage}
                    style={{
                      backgroundImage: post.cover_image ? `url(${post.cover_image})` : undefined,
                    }}
                    aria-hidden={!post.cover_image}
                  />
                  <div className={blogStyles.blogCardBody}>
                    <h3 className={blogStyles.blogCardTitle}>{post.title}</h3>
                    {post.published_at && (
                      <p className={blogStyles.blogCardMeta}>
                        {dateFormatter.format(new Date(post.published_at))}
                      </p>
                    )}
                    {post.excerpt && <p className={blogStyles.blogCardExcerpt}>{post.excerpt}</p>}
                  </div>
                  <footer className={blogStyles.blogCardFooter}>
                    <Link
                      className={blogStyles.blogCardLink}
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Artikel ansehen
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminSidebar from "../adminComponents/adminSidebar/AdminSidebar";
import styles from "../page.module.css";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import blogStyles from "./page.module.css";
import "../adminComponents/adminPageHader.css";
import { supabase } from "@/lib/supabaseClient";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
};

export default function BlogManager() {
  const { loading: verifying } = useVerifyAdminAccess();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (verifying) {
      return;
    }

    async function loadPosts() {
      setLoadingPosts(true);
      setError(null);

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {
        setError(error.message);
        setPosts([]);
      } else if (data) {
        setPosts(data);
      }

      setLoadingPosts(false);
    }

    loadPosts();
  }, [verifying]);

  const formattedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        publishedDate: post.published_at
          ? new Date(post.published_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : null,
      })),
    [posts]
  );

  if (verifying) {
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

        <section className={blogStyles.publishedSection}>
          <div className={blogStyles.sectionHeading}>
            <h2>Veröffentlichte Artikel</h2>
            <p>
              Alle aktuell veröffentlichten Beiträge auf einen Blick. Wähle einen Artikel aus,
              um ihn auf der Website anzusehen.
            </p>
          </div>

          {loadingPosts && <p>Beiträge werden geladen...</p>}
          {error && !loadingPosts && (
            <p className={blogStyles.errorMessage}>Fehler beim Laden: {error}</p>
          )}
          {!loadingPosts && !error && formattedPosts.length === 0 && (
            <p>Noch keine veröffentlichten Artikel vorhanden.</p>
          )}

          {!loadingPosts && !error && formattedPosts.length > 0 && (
            <div className={blogStyles.postsGrid}>
              {formattedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={blogStyles.postCard}
                  prefetch={false}
                >
                  <div className={blogStyles.postImageWrapper}>
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt=""
                        width={600}
                        height={450}
                        className={blogStyles.postImage}
                        sizes="(max-width: 600px) 100vw, 280px"
                        unoptimized
                      />
                    ) : (
                      <div className={blogStyles.postImagePlaceholder} aria-hidden="true">
                        <i className="bi bi-journal-text"></i>
                      </div>
                    )}
                  </div>
                  <div className={blogStyles.postCardBody}>
                    <h3>{post.title}</h3>
                    {post.publishedDate && <time dateTime={post.published_at ?? undefined}>{post.publishedDate}</time>}
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

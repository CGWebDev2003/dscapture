import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
};

export const metadata: Metadata = {
  title: "Blog | DS_Capture",
  description: "Neuigkeiten und Updates von DS_Capture im Überblick.",
  openGraph: {
    title: "Blog | DS_Capture",
    description: "Neuigkeiten und Updates von DS_Capture im Überblick.",
    url: "https://ds-capture.de/blog",
    siteName: "DS_Capture",
    locale: "de_DE",
    type: "website",
  },
};

export default async function BlogPage() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const posts: BlogPost[] = data ?? [];

  return (
    <div className={styles.blogContent}>
      <div className={styles.blogHeader}>
        <h1>Blog</h1>
        <p>Hier findest du alle veröffentlichten Beiträge von DS_Capture.</p>
      </div>

      {error && <p className={styles.errorMessage}>Beiträge konnten nicht geladen werden.</p>}
      {!error && posts.length === 0 && (
        <p className={styles.emptyState}>Derzeit sind noch keine Blogbeiträge veröffentlicht.</p>
      )}

      {!error && posts.length > 0 && (
        <div className={styles.postsGrid}>
          {posts.map((post) => {
            const publishedDate = post.published_at
              ? new Date(post.published_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : null;

            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className={styles.postCard} prefetch={false}>
                <div className={styles.postImageWrapper}>
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt=""
                      width={720}
                      height={540}
                      className={styles.postImage}
                      sizes="(max-width: 768px) 100vw, 320px"
                      unoptimized
                    />
                  ) : (
                    <div className={styles.postImagePlaceholder} aria-hidden="true">
                      <i className="bi bi-journal-text"></i>
                    </div>
                  )}
                </div>
                <div className={styles.postCardBody}>
                  <h2>{post.title}</h2>
                  {publishedDate && <time dateTime={post.published_at ?? undefined}>{publishedDate}</time>}
                  {post.excerpt && <p>{post.excerpt}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

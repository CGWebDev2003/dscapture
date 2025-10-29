import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./page.module.css";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string | null;
};

interface PageParams {
  params: { slug: string };
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select<BlogPost>("id, title, slug, excerpt, content, cover_image, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const post = await fetchPost(params.slug).catch(() => null);

  if (!post) {
    return {
      title: "Artikel nicht gefunden | DS_Capture",
    };
  }

  const description = post.excerpt ?? post.content.slice(0, 160);

  return {
    title: `${post.title} | DS_Capture`,
    description,
    openGraph: {
      title: `${post.title} | DS_Capture`,
      description,
      url: `https://ds-capture.de/blog/${post.slug}`,
      siteName: "DS_Capture",
      locale: "de_DE",
      type: "article",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageParams) {
  const post = await fetchPost(params.slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const paragraphs = post.content
    ? post.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : [];

  return (
    <article className={styles.postPage}>
      <Link href="/blog" className={styles.backLink} prefetch={false}>
        <i className="bi bi-arrow-left"></i> Zurück zur Übersicht
      </Link>

      <header className={styles.postHeader}>
        <h1>{post.title}</h1>
        {publishedDate && <time dateTime={post.published_at ?? undefined}>{publishedDate}</time>}
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
      </header>

      {post.cover_image && (
        <div className={styles.coverImageWrapper}>
          <Image
            src={post.cover_image}
            alt=""
            width={1600}
            height={900}
            className={styles.coverImage}
            sizes="100vw"
            unoptimized
          />
        </div>
      )}

      <div className={styles.postBody}>
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p key={index}>
              {paragraph.split(/\n/).map((line, lineIndex, lines) => (
                <span key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          ))
        ) : (
          <p>{post.content}</p>
        )}
      </div>
    </article>
  );
}

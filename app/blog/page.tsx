import type { Metadata } from 'next';
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: 'Blog | DS_Capture',
  description: '',
  openGraph: {
    title: 'Blog | DS_Capture',
    description: '',
    url: 'https://ds-capture.de/blog',
    siteName: 'DS_Capture',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function BlogPage() {
    return(
        <div className={styles.blogContent}>
            <h1>Blog</h1>
        </div>
    );
}
import type { Metadata } from 'next';
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: 'Portfolio | DS_Capture',
  description: '',
  openGraph: {
    title: 'Portfolio | DS_Capture',
    description: '',
    url: 'https://ds-capture.de/portfolio',
    siteName: 'DS_Capture',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function BlogPage() {
    return(
      <div className={styles.blogContent}>
        <h1>Portfolio</h1>
      </div>
    );
}
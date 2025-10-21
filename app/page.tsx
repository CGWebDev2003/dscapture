import type { Metadata } from 'next';
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: 'Home | DS_Capture',
  description: '',
  openGraph: {
    title: 'Home | DS_Capture',
    description: '',
    url: 'https://ds-capture.de/',
    siteName: 'DS_Capture',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className={styles.homeContent}>
      <h1>Home</h1>
    </div>
  );
}

import type { Metadata } from 'next';
import Image from "next/image";
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
      <div className={styles.wrapper}>
        {/* Hintergrundbild */}
        <Image
          src="/DJI_0727.jpg"
          alt="Hintergrund"
          fill
          className={styles.background}
        />

        {/* Überlagerndes Bild */}
        <Image
          src="/dawid3.jpeg"
          alt="Overlay"
          width={200}
          height={200}
          className={styles.overlay}
        />
      </div>
    </div>
  );
}

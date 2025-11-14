"use client";

import Link from "next/link";
import styles from "./cookieConsent.module.css";

interface CookieBannerProps {
  visible: boolean;
  onAcceptAll: () => void;
  onAcceptNecessary: () => void;
  onOpenPreferences: () => void;
}

export default function CookieBanner({
  visible,
  onAcceptAll,
  onAcceptNecessary,
  onOpenPreferences,
}: CookieBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="cookie-banner-title"
    >
      <div className={styles.bannerContent}>
        <h2 id="cookie-banner-title" className={styles.bannerTitle}>
          Cookies & Datenschutz
        </h2>
        <p className={styles.bannerDescription}>
          Wir verwenden Cookies, um unsere Website nutzerfreundlich zu gestalten und optionale
          Dienste wie Statistik- und Marketingfunktionen nur mit deiner Zustimmung zu aktivieren.
          Du kannst deine Auswahl jederzeit anpassen. Weitere Informationen findest du in unserer{" "}
          <Link className={styles.bannerLink} href="/datenschutz">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </div>
      <div className={styles.bannerActions}>
        <button type="button" className={styles.secondaryButton} onClick={onAcceptNecessary}>
          Nur notwendige Cookies
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onOpenPreferences}>
          Einstellungen
        </button>
        <button type="button" className={styles.primaryButton} onClick={onAcceptAll}>
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./cookieConsent.module.css";
import type { CookieConsentSettings } from "./CookieConsentProvider";

interface CookiePreferencesDialogProps {
  open: boolean;
  consent: CookieConsentSettings;
  onClose: () => void;
  onSave: (settings: CookieConsentSettings) => void;
}

type ToggleKeys = Exclude<keyof CookieConsentSettings, "necessary">;

const toggleLabels: Record<ToggleKeys, { title: string; description: string }> = {
  analytics: {
    title: "Statistik",
    description:
      "Hilft uns zu verstehen, wie Besucher unsere Website nutzen, um sie fortlaufend zu verbessern.",
  },
  marketing: {
    title: "Marketing",
    description:
      "Ermöglicht personalisierte Inhalte und Angebote, basierend auf deinem Nutzungsverhalten.",
  },
};

export default function CookiePreferencesDialog({
  open,
  consent,
  onClose,
  onSave,
}: CookiePreferencesDialogProps) {
  const [localConsent, setLocalConsent] = useState(consent);

  useEffect(() => {
    setLocalConsent(consent);
  }, [consent, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const handleToggle = (key: ToggleKeys) => {
    setLocalConsent((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div
      className={styles.dialogOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      onClick={onClose}
    >
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2 id="cookie-preferences-title" className={styles.dialogTitle}>
            Cookie-Einstellungen
          </h2>
          <button type="button" className={styles.dialogCloseButton} onClick={onClose} aria-label="Einstellungen schließen">
            <i className="bi bi-x-lg" aria-hidden />
          </button>
        </div>

        <p className={styles.dialogDescription}>
          Hier kannst du auswählen, welche zusätzlichen Cookies wir setzen dürfen. Essenzielle Cookies
          sind immer aktiv, da sie für den Betrieb der Website notwendig sind.
        </p>

        <div className={styles.preferenceList}>
          <div className={styles.preferenceItem}>
            <div className={styles.preferenceHeader}>
              <span className={styles.preferenceTitle}>Essenzielle Cookies</span>
              <span className={styles.preferenceBadge}>Immer aktiv</span>
            </div>
            <p className={styles.preferenceDescription}>
              Diese Cookies sind erforderlich, damit die Website funktioniert und um sicherzustellen,
              dass dein Besuch reibungslos abläuft.
            </p>
          </div>

          {Object.entries(toggleLabels).map(([key, value]) => {
            const typedKey = key as ToggleKeys;

            return (
              <label key={key} className={styles.preferenceItem} htmlFor={`cookie-toggle-${key}`}>
                <div className={styles.preferenceHeader}>
                  <span className={styles.preferenceTitle}>{value.title}</span>
                  <div className={styles.toggleWrapper}>
                    <input
                      id={`cookie-toggle-${key}`}
                      type="checkbox"
                      checked={localConsent[typedKey]}
                      onChange={() => handleToggle(typedKey)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleVisual} aria-hidden />
                  </div>
                </div>
                <p className={styles.preferenceDescription}>{value.description}</p>
              </label>
            );
          })}
        </div>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onSave(localConsent)}
          >
            Auswahl speichern
          </button>
        </div>
      </div>
    </div>
  );
}

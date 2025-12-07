"use client";

import { FormEvent, useEffect, useState } from "react";

import AdminSidebar from "../../adminComponents/adminSidebar/AdminSidebar";
import styles from "./page.module.css";
import { useVerifyAdminAccess } from "@/lib/verifyAdminAccess";
import { supabase } from "@/lib/supabaseClient";
import { logUserAction } from "@/lib/logger";
import { useToast } from "@/components/toast/ToastProvider";

interface HeroFormState {
  heading: string;
  subheading: string;
  ctaLabel: string;
}

const DEFAULT_FORM_STATE: HeroFormState = {
  heading: "",
  subheading: "",
  ctaLabel: "Jetzt Kontaktieren",
};

export default function AdminHomepageHeroPage() {
  const { loading: verifying } = useVerifyAdminAccess();
  const { showToast } = useToast();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [formState, setFormState] = useState<HeroFormState>(DEFAULT_FORM_STATE);
  const [loadingContent, setLoadingContent] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (verifying) {
      return;
    }

    const fetchHeroContent = async () => {
      setLoadingContent(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("homepage_hero_content")
        .select("id, heading, subheading, cta_label")
        .eq("singleton_key", "hero")
        .maybeSingle();

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("Fehler beim Laden der Hero-Texte:", error.message);
          setFetchError("Die Hero-Texte konnten nicht geladen werden. Bitte versuche es erneut.");
        }

        setRecordId(null);
        setFormState(DEFAULT_FORM_STATE);
        setLoadingContent(false);
        return;
      }

      if (data) {
        const normalized: HeroFormState = {
          heading: data.heading?.trim() ?? "",
          subheading: data.subheading?.trim() ?? "",
          ctaLabel: data.cta_label?.trim() ?? DEFAULT_FORM_STATE.ctaLabel,
        };

        setRecordId(data.id);
        setFormState(normalized);
      } else {
        setRecordId(null);
        setFormState(DEFAULT_FORM_STATE);
      }

      setLoadingContent(false);
    };

    void fetchHeroContent();
  }, [verifying]);

  const handleFieldChange = (field: keyof HeroFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);

    const trimmedHeading = formState.heading.trim();
    const trimmedSubheading = formState.subheading.trim();
    const trimmedCtaLabel = formState.ctaLabel.trim() || DEFAULT_FORM_STATE.ctaLabel;

    if (!trimmedHeading || !trimmedSubheading) {
      setFormError("Bitte gib sowohl die Überschrift als auch die Unterzeile an.");
      return;
    }

    setSaving(true);

    const payload: { id?: string; singleton_key: string; heading: string; subheading: string; cta_label: string } = {
      singleton_key: "hero",
      heading: trimmedHeading,
      subheading: trimmedSubheading,
      cta_label: trimmedCtaLabel,
    };

    if (recordId) {
      payload.id = recordId;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("homepage_hero_content")
        .upsert(payload, { onConflict: "singleton_key" })
        .select("id, heading, subheading, cta_label")
        .single();

      if (error) {
        throw error;
      }

      const normalized: HeroFormState = {
        heading: data.heading?.trim() ?? "",
        subheading: data.subheading?.trim() ?? "",
        ctaLabel: data.cta_label?.trim() ?? DEFAULT_FORM_STATE.ctaLabel,
      };

      setRecordId(data.id);
      setFormState(normalized);
      setStatusMessage("Die Hero-Texte wurden gespeichert.");
      showToast({ message: "Hero-Texte gespeichert.", type: "success" });

      await logUserAction({
        action: "homepage_hero_content_saved",
        context: "admin",
        userId: user?.id,
        userEmail: user?.email ?? null,
        entityType: "homepage_hero_content",
        entityId: data.id,
        metadata: {
          hasCustomCta: Boolean(data.cta_label?.trim()),
          headingLength: data.heading?.length ?? 0,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Die Hero-Texte konnten nicht gespeichert werden.";
      console.error("Fehler beim Speichern der Hero-Texte:", message);
      setFormError("Die Hero-Texte konnten nicht gespeichert werden. Bitte versuche es erneut.");
      showToast({ message: "Speichern fehlgeschlagen.", type: "error" });

      const { data: authData } = await supabase.auth.getUser();
      await logUserAction({
        action: "homepage_hero_content_save_failed",
        context: "admin",
        userId: authData?.user?.id,
        userEmail: authData?.user?.email ?? null,
        entityType: "homepage_hero_content",
        entityId: recordId,
        metadata: {
          error: message,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <main className="admin-content">
        <div className={styles.pageContent}>
          <header className={styles.header}>
            <h1>Hero-Texte</h1>
            <p>
              Verwalte alle Texte des Hero-Bereichs auf der Homepage. Änderungen werden direkt auf der Seite
              sichtbar, sobald sie gespeichert wurden.
            </p>
          </header>

          <section className={styles.formCard} aria-busy={loadingContent} aria-live="polite">
            <div className={styles.formHeader}>
              <h2>Texte bearbeiten</h2>
              <p>Pflege Überschrift, Unterzeile und Button-Text des Hero-Bereichs.</p>
            </div>

            {fetchError ? <p className={styles.errorMessage}>{fetchError}</p> : null}
            {formError ? <p className={styles.errorMessage}>{formError}</p> : null}
            {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

            <form onSubmit={handleSubmit} className={styles.formFields}>
              <div className={styles.field}>
                <label htmlFor="hero-heading">Überschrift</label>
                <input
                  id="hero-heading"
                  name="heading"
                  type="text"
                  placeholder="z. B. Visuelle Exzellenz. Digitale Präzision."
                  value={formState.heading}
                  onChange={(event) => handleFieldChange("heading", event.target.value)}
                  disabled={loadingContent || saving}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="hero-subheading">Unterzeile</label>
                <textarea
                  id="hero-subheading"
                  name="subheading"
                  placeholder="Kurze Unterstützung für die Überschrift"
                  value={formState.subheading}
                  onChange={(event) => handleFieldChange("subheading", event.target.value)}
                  disabled={loadingContent || saving}
                  required
                />
                <p className={styles.helperText}>Dieser Text wird unterhalb der Überschrift angezeigt.</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="hero-cta-label">Button-Text</label>
                <input
                  id="hero-cta-label"
                  name="ctaLabel"
                  type="text"
                  placeholder="z. B. Jetzt Kontaktieren"
                  value={formState.ctaLabel}
                  onChange={(event) => handleFieldChange("ctaLabel", event.target.value)}
                  disabled={loadingContent || saving}
                />
                <p className={styles.helperText}>Leer lassen, um den Standardtext zu nutzen.</p>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryButton} disabled={saving || loadingContent}>
                  {saving ? "Speichern…" : "Speichern"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

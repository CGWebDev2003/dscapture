"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import CookieBanner from "./CookieBanner";
import CookiePreferencesDialog from "./CookiePreferencesDialog";

const CONSENT_COOKIE_NAME = "cookie-consent";

export type CookieConsentSettings = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextValue = {
  consent: CookieConsentSettings;
  hasConsent: boolean;
  acceptAll: () => void;
  acceptNecessary: () => void;
  updateConsent: (settings: CookieConsentSettings) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const defaultConsent: CookieConsentSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(
  undefined,
);

function parseConsentCookie(value: string | undefined): CookieConsentSettings | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsentSettings> | null;

    if (!parsed) {
      return null;
    }

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch (error) {
    console.error("Ungültiger Cookie-Consent-Wert", error);
    return null;
  }
}

function persistConsent(settings: CookieConsentSettings) {
  const cookieValue = JSON.stringify({
    ...settings,
    necessary: true,
    updatedAt: new Date().toISOString(),
  });

  Cookies.set(CONSENT_COOKIE_NAME, cookieValue, {
    expires: 180,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<CookieConsentSettings>(defaultConsent);
  const [hasConsent, setHasConsent] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const storedConsent = parseConsentCookie(Cookies.get(CONSENT_COOKIE_NAME));

    if (storedConsent) {
      setConsent(storedConsent);
      setHasConsent(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const nextConsent: CookieConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
    };

    setConsent(nextConsent);
    setHasConsent(true);
    persistConsent(nextConsent);
    setPreferencesOpen(false);
  }, []);

  const acceptNecessary = useCallback(() => {
    const nextConsent: CookieConsentSettings = {
      ...defaultConsent,
    };

    setConsent(nextConsent);
    setHasConsent(true);
    persistConsent(nextConsent);
    setPreferencesOpen(false);
  }, []);

  const updateConsent = useCallback((settings: CookieConsentSettings) => {
    const nextConsent = {
      ...settings,
      necessary: true,
    } as CookieConsentSettings;

    setConsent(nextConsent);
    setHasConsent(true);
    persistConsent(nextConsent);
    setPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      consent,
      hasConsent,
      acceptAll,
      acceptNecessary,
      updateConsent,
      openPreferences,
      closePreferences,
    }),
    [
      acceptAll,
      acceptNecessary,
      closePreferences,
      consent,
      hasConsent,
      openPreferences,
      updateConsent,
    ],
  );

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      <CookieBanner
        visible={!hasConsent && !preferencesOpen}
        onAcceptAll={acceptAll}
        onAcceptNecessary={acceptNecessary}
        onOpenPreferences={openPreferences}
      />
      <CookiePreferencesDialog
        open={preferencesOpen}
        consent={consent}
        onClose={closePreferences}
        onSave={updateConsent}
      />
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsentContext() {
  return useContext(CookieConsentContext);
}

export function useCookieConsent() {
  const context = useCookieConsentContext();

  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }

  return context;
}

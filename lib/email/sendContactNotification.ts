import { buildContactTemplateParams, type ContactEmailPayload } from "./contactEmail";

const API_ENDPOINT = "/api/contact-notification";
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const PUBLIC_EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

const hasPublicEmailJsConfig = Object.values(PUBLIC_EMAILJS_CONFIG).every(Boolean);

const parseErrorBody = (raw: string) => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { error?: string; details?: string };
  } catch {
    return null;
  }
};

const formatErrorMessage = (status: number, errorBody: { error?: string; details?: string } | null, raw: string) => {
  if (errorBody?.error) {
    return errorBody.details ? `${errorBody.error}: ${errorBody.details}` : errorBody.error;
  }

  if (raw) {
    return `Status ${status}: ${raw}`;
  }

  return `Status ${status}`;
};

const sendDirectlyToEmailJs = async (payload: ContactEmailPayload) => {
  if (!hasPublicEmailJsConfig) {
    throw new Error("EmailJS is not configured for the fallback client request.");
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: PUBLIC_EMAILJS_CONFIG.serviceId,
      template_id: PUBLIC_EMAILJS_CONFIG.templateId,
      public_key: PUBLIC_EMAILJS_CONFIG.publicKey,
      user_id: PUBLIC_EMAILJS_CONFIG.publicKey,
      template_params: buildContactTemplateParams(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Fallback EmailJS request failed with ${response.status}${errorText ? `: ${errorText}` : ""}`,
    );
  }
};

export const sendContactNotification = async (payload: ContactEmailPayload) => {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const errorBody = parseErrorBody(errorText);

    const isServerMisconfigured =
      errorBody?.error === "Die E-Mail-Benachrichtigung ist nicht konfiguriert." && hasPublicEmailJsConfig;

    if (isServerMisconfigured) {
      return sendDirectlyToEmailJs(payload);
    }

    throw new Error(`Contact notification failed: ${formatErrorMessage(response.status, errorBody, errorText)}`);
  }
};

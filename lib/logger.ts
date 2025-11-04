import { supabase } from "./supabaseClient";

export type LogContext = "public" | "admin" | "system";

export type LogUserActionParams = {
  action: string;
  description?: string;
  context?: LogContext;
  userId?: string | null;
  userEmail?: string | null;
  entityType?: string | null;
  entityId?: string | number | null;
  metadata?: Record<string, unknown> | null;
};

export async function logUserAction({
  action,
  description,
  context,
  userId,
  userEmail,
  entityType,
  entityId,
  metadata,
}: LogUserActionParams) {
  const payload = {
    action,
    description: description ?? null,
    context: context ?? null,
    user_id: userId ?? null,
    user_email: userEmail ?? null,
    entity_type: entityType ?? null,
    entity_id: entityId !== undefined && entityId !== null ? String(entityId) : null,
    metadata: metadata ?? null,
  };

  const { error } = await supabase.from("activity_logs").insert(payload);

  if (error) {
    console.error("Fehler beim Speichern des Log-Eintrags", error);
  }

  return !error;
}

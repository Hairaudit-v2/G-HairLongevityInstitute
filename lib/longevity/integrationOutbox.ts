import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedLongevityEventEnvelope } from "./normalizedEvents";
import type { NormalizedLongevitySignal } from "./normalizedSignals";

type IntegrationOutboxInsert = {
  profile_id?: string | null;
  intake_id?: string | null;
  blood_request_id?: string | null;
  document_id?: string | null;
  emission_kind: "event" | "signal";
  emission_key: string;
  schema_version: string;
  payload: Record<string, unknown>;
};

/**
 * Stage normalized longevity events/signals in a longevity-only outbox.
 * This keeps HLI as the source of truth while making downstream integration inspectable.
 */
export async function stageLongevityIntegrationArtifacts(
  supabase: SupabaseClient,
  params: {
    profile_id?: string | null;
    intake_id?: string | null;
    blood_request_id?: string | null;
    document_id?: string | null;
    event?: NormalizedLongevityEventEnvelope | null;
    signals?: NormalizedLongevitySignal[] | null;
  }
): Promise<void> {
  const rows: IntegrationOutboxInsert[] = [];

  if (params.event) {
    rows.push({
      profile_id: params.profile_id ?? null,
      intake_id: params.intake_id ?? null,
      blood_request_id: params.blood_request_id ?? null,
      document_id: params.document_id ?? null,
      emission_kind: "event",
      emission_key: params.event.event_type,
      schema_version: params.event.source_version,
      payload: params.event as unknown as Record<string, unknown>,
    });
  }

  for (const signal of params.signals ?? []) {
    rows.push({
      profile_id: params.profile_id ?? null,
      intake_id: params.intake_id ?? null,
      blood_request_id: params.blood_request_id ?? null,
      document_id: params.document_id ?? null,
      emission_kind: "signal",
      emission_key: signal.signal_key,
      schema_version: signal.source_version,
      payload: signal as unknown as Record<string, unknown>,
    });
  }

  if (!rows.length) return;

  await supabase.from("hli_longevity_integration_outbox").insert(rows);
}

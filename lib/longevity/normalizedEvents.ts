import {
  LONGEVITY_EVENT_CONTRACT_VERSION,
  LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
  buildLongevityEntityRefs,
  type LongevityActorType,
  type LongevityEntityRefType,
  type LongevityEntityRefs,
  type LongevityEventType,
} from "./integrationContracts";

export type NormalizedLongevityEventEnvelope = {
  event_id: string;
  event_type: LongevityEventType;
  source_system: typeof LONGEVITY_INTEGRATION_SOURCE_SYSTEM;
  source_version: typeof LONGEVITY_EVENT_CONTRACT_VERSION;
  occurred_at: string;
  actor_type?: LongevityActorType;
  entity_refs: LongevityEntityRefs;
  payload?: Record<string, unknown>;
};

export function buildLongevityEventEnvelope(params: {
  event_type: LongevityEventType;
  occurred_at?: string;
  actor_type?: LongevityActorType;
  local_entity_type: LongevityEntityRefType;
  local_entity_id: string;
  payload?: Record<string, unknown>;
}): NormalizedLongevityEventEnvelope {
  return {
    event_id: crypto.randomUUID(),
    event_type: params.event_type,
    source_system: LONGEVITY_INTEGRATION_SOURCE_SYSTEM,
    source_version: LONGEVITY_EVENT_CONTRACT_VERSION,
    occurred_at: params.occurred_at ?? new Date().toISOString(),
    actor_type: params.actor_type,
    entity_refs: buildLongevityEntityRefs(
      params.local_entity_type,
      params.local_entity_id
    ),
    payload: params.payload ?? {},
  };
}

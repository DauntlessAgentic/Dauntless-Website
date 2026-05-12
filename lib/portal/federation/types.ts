// ============================================================
// Federation primitive (Phase 12.0)
//
// Federations let workspaces opt artifacts into a shared
// canonical layer with peer workspaces in the same sector.
// Anonymization runs at opt-in time; the artifact's federation
// snapshot is what other federation members see.
//
// Phase 12.0 ships the shape + sector federation catalog +
// anonymization pipeline. Phase 12.1 wires real cross-tenant
// search + governance.
// ============================================================

export type FederationSector =
  | "federal-canada"
  | "federal-us"
  | "healthcare"
  | "financial-services";

export type FederationMembershipStatus = "active" | "paused" | "withdrawn";

export interface FederationDefinition {
  id: string;
  name: string;
  sector: FederationSector;
  description: string;
  /** Stewarded by Dauntless; lists which canonical anchors are pre-loaded. */
  curatedAnchors: string[];
  /** Member count across all participating workspaces. */
  memberCount: number;
  /** Pricing tier — Phase 14 wires real billing. */
  tier: "foundation" | "professional" | "strategic";
}

export interface FederationContributionInput {
  workspaceId: string;
  federationId: string;
  artifactId: string;
  contributedBy: string;
  anonymizationLevel: "light" | "standard" | "strict";
}

export interface FederationContribution {
  id: string;
  workspaceId: string;
  federationId: string;
  artifactId: string;
  contributedAt: Date;
  contributedBy: string;
  anonymizationLevel: "light" | "standard" | "strict";
  /** Anonymized snapshot of the artifact's body at contribution time. */
  snapshot: {
    title: string;
    description: string;
    body: string;
  };
  /** Status: `active` while contributed; `withdrawn` once revoked. */
  status: "active" | "withdrawn";
  withdrawnAt?: Date;
  withdrawnBy?: string;
}

export interface FederationMembership {
  federationId: string;
  workspaceId: string;
  joinedAt: Date;
  status: FederationMembershipStatus;
  /** Number of artifacts this workspace has contributed. */
  contributionCount: number;
}

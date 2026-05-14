// ============================================================
// Bilingual dictionary (EN / FR) — advisory action #26
//
// Minimum-viable i18n. Single dictionary keyed by stable string
// ids; `t(id, locale)` returns the right phrase. Falls back to
// English when an id is missing in French.
//
// This scaffolding ships the highest-traffic strings (Command
// Center labels, governance tabs, glossary). Full FR coverage
// is a follow-up.
//
// Format chosen so a translator can hand back a single JSON
// without touching code.
// ============================================================

export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];

export const LOCALE_COOKIE = "dauntless-locale";

const dict: Record<string, { en: string; fr: string }> = {
  // Command Center
  "cc.this-week.title.empty": {
    en: "Nothing requires your attention right now",
    fr: "Rien n'exige votre attention pour le moment",
  },
  "cc.this-week.subtitle": {
    en: "Personalised for your role. Tap a row to act on it.",
    fr: "Personnalisé selon votre rôle. Cliquez sur une ligne pour agir.",
  },
  "cc.this-week.empty-body": {
    en: "Decisions, approvals, and urgent proposals will appear here as they come in.",
    fr: "Les décisions, approbations et propositions urgentes apparaîtront ici.",
  },
  "cc.this-week.badge.urgent": { en: "urgent", fr: "urgent" },
  "cc.this-week.badge.review": { en: "to review", fr: "à examiner" },
  "cc.this-week.badge.all-clear": { en: "all clear", fr: "rien à signaler" },

  // Roles (display labels — match roleDisplayLabel())
  "role.owner": { en: "Owner", fr: "Propriétaire" },
  "role.executive": { en: "Approver", fr: "Approbateur" },
  "role.lead": { en: "Manager", fr: "Gestionnaire" },
  "role.viewer": { en: "Read-only", fr: "Lecture seule" },
  "role.auditor": { en: "Auditor", fr: "Auditeur" },

  // Governance
  "gov.controls.title": {
    en: "Posture right now — plain English",
    fr: "Posture actuelle — en langage clair",
  },
  "gov.controls.eyebrow": { en: "CONTROLS IN FORCE", fr: "CONTRÔLES EN VIGUEUR" },
  "gov.audit-log.eyebrow": { en: "AUDIT LOG", fr: "JOURNAL D'AUDIT" },
  "gov.export.signed": { en: "Official record (signed)", fr: "Document officiel (signé)" },
  "gov.connectors.title": { en: "Connectors", fr: "Connecteurs" },
  "gov.safety-switch.title": { en: "Safety switch", fr: "Interrupteur de sécurité" },

  // Outbound actions
  "actions.explainer.title": {
    en: "Propose → Approve → Commit (or dry-run first)",
    fr: "Proposer → Approuver → Confirmer (ou simulation d'abord)",
  },
  "actions.explainer.step1.title": { en: "1 · Propose", fr: "1 · Proposer" },
  "actions.explainer.step1.body": {
    en: "Someone (a teammate or an agent) drafts an action. Nothing leaves the portal yet.",
    fr: "Une personne ou un agent rédige une action. Rien ne quitte le portail à ce stade.",
  },
  "actions.explainer.step2.title": { en: "2 · Approve", fr: "2 · Approuver" },
  "actions.explainer.step2.body": {
    en: "A human reviews. They can approve, reject, or — for risky things — request a dry-run first.",
    fr: "Un humain examine. Approuver, rejeter, ou — pour les actions à risque — demander une simulation.",
  },
  "actions.explainer.step3.title": { en: "3 · Commit", fr: "3 · Confirmer" },
  "actions.explainer.step3.body": {
    en: "The action executes against the external system. The recorded inverse plan can roll it back.",
    fr: "L'action s'exécute dans le système externe. Le plan inverse enregistré permet de l'annuler.",
  },

  // Help
  "help.glossary.title": { en: "Glossary", fr: "Glossaire" },
  "help.swr.title": {
    en: "Something feels wrong — here's what to do",
    fr: "Quelque chose ne va pas — voici la marche à suivre",
  },
  "help.swr.button.freeze": {
    en: "Freeze all outbound actions",
    fr: "Geler toutes les actions sortantes",
  },
  "help.swr.button.unfreeze": { en: "Lift the freeze", fr: "Lever le gel" },

  // Generic
  "common.workspace": { en: "Workspace", fr: "Espace de travail" },
  "common.cancel": { en: "Cancel", fr: "Annuler" },
  "common.confirm": { en: "Confirm", fr: "Confirmer" },
  "common.download": { en: "Download", fr: "Télécharger" },
  "common.preview": { en: "Preview", fr: "Aperçu" },
  "common.snooze-24h": { en: "Snooze 24h", fr: "Reporter 24h" },
};

export function t(id: string, locale: Locale = "en"): string {
  const entry = dict[id];
  if (!entry) return id;
  return entry[locale] ?? entry.en;
}

export function listTranslationIds(): string[] {
  return Object.keys(dict);
}

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr";
}

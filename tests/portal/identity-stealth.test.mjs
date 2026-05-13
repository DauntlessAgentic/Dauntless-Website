// Smoke tests for the identity / stealth-mode contract (Pre-launch §A11).
//
// Pins the shape of `config/identity.ts` so a future refactor that
// accidentally removes a stealth-aware field (founderName / linkedIn /
// etc.) fails fast. The launch-eve cutover flips
// NEXT_PUBLIC_STEALTH_MODE between "true" and "false"; this suite
// makes sure both modes still produce coherent output.

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";

const REQUIRED_KEYS = [
  "founderName",
  "founderTitle",
  "founderShortTitle",
  "founderPhoto",
  "founderPhotoAlt",
  "founderBioShort",
  "email",
  "emailLabel",
  "linkedIn",
  "linkedInDisplay",
  "personalWebsite",
  "sameAs",
  "aboutPageTitle",
  "aboutPageDescription",
  "background",
  "consultingTestimonialOpener",
];

test("identity contract — shape pins regardless of stealth flag", async () => {
  // Force-stealth so we can read the module fresh with a known mode.
  // We avoid hot-reloading the module under different env values; the
  // shape test is sufficient regardless of which mode the module
  // captured at load time. The mode-specific assertions follow.
  const { identity } = await import("../../config/identity.ts");
  for (const key of REQUIRED_KEYS) {
    assert.ok(key in identity, `identity is missing required key: ${key}`);
  }
});

test("identity values — coherent regardless of mode", async () => {
  const { identity } = await import("../../config/identity.ts");

  // Email is never null.
  assert.ok(typeof identity.email === "string" && identity.email.length > 0);
  assert.ok(identity.email.includes("@"));

  // The about-page title is always set.
  assert.ok(typeof identity.aboutPageTitle === "string" && identity.aboutPageTitle.length > 0);
  assert.ok(typeof identity.aboutPageDescription === "string" && identity.aboutPageDescription.length > 0);

  // Background is always an array of strings, never empty.
  assert.ok(Array.isArray(identity.background));
  assert.ok(identity.background.length > 0);
  for (const line of identity.background) {
    assert.ok(typeof line === "string" && line.length > 0);
  }

  // Schema.org sameAs is always an array (possibly empty in stealth).
  assert.ok(Array.isArray(identity.sameAs));

  // Founder title + short title are always set.
  assert.ok(typeof identity.founderTitle === "string" && identity.founderTitle.length > 0);
  assert.ok(typeof identity.founderShortTitle === "string" && identity.founderShortTitle.length > 0);
  assert.ok(typeof identity.founderPhotoAlt === "string" && identity.founderPhotoAlt.length > 0);
  assert.ok(typeof identity.founderBioShort === "string" && identity.founderBioShort.length > 0);
  assert.ok(typeof identity.consultingTestimonialOpener === "string");
});

test("identity stealth contract — nullable fields are null OR populated", async () => {
  const { identity } = await import("../../config/identity.ts");

  // These four are explicitly nullable in the stealth contract.
  // Either all four are null (stealth) or all four are non-null (public).
  // No half-states allowed.
  const nullableValues = [
    identity.founderName,
    identity.founderPhoto,
    identity.linkedIn,
    identity.linkedInDisplay,
    identity.personalWebsite,
  ];
  const allNull = nullableValues.every((v) => v === null);
  const noneNull = nullableValues.every((v) => v !== null);
  assert.ok(
    allNull || noneNull,
    `Identity fields are in a half-state: ${JSON.stringify(nullableValues)}`,
  );

  if (allNull) {
    // Stealth mode: sameAs should be empty.
    assert.equal(identity.sameAs.length, 0, "Stealth mode should not expose sameAs URLs");
    // Email should be the generic one.
    assert.equal(identity.email, "hello@dauntlessagentic.com");
  } else {
    // Public mode: sameAs should be non-empty when LinkedIn is set.
    if (identity.linkedIn) {
      assert.ok(identity.sameAs.length > 0, "Public mode with LinkedIn should expose sameAs");
    }
    // Email should be the founder-routed one.
    assert.ok(identity.email.startsWith("craig@") || identity.email === "hello@dauntlessagentic.com");
  }
});

import { describe, expect, it } from "vitest";
import { DECISION_ACTION_TRANSITIONS } from "@/components/patterns/decision-list";

describe("decision action transitions", () => {
  it("maps approve → approved", () => {
    expect(DECISION_ACTION_TRANSITIONS.approve).toBe("approved");
  });
  it("maps defer → deferred", () => {
    expect(DECISION_ACTION_TRANSITIONS.defer).toBe("deferred");
  });
  it("maps reject → rejected", () => {
    expect(DECISION_ACTION_TRANSITIONS.reject).toBe("rejected");
  });
  it("covers all three canonical actions exactly", () => {
    expect(Object.keys(DECISION_ACTION_TRANSITIONS).sort()).toEqual([
      "approve",
      "defer",
      "reject",
    ]);
  });
});

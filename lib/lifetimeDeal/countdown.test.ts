import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCountdownParts,
  isLtdOfferLive,
  ltdStatusPollingIntervalMs,
  pad2,
  serverAlignedNowMs,
  shouldShowAnnualPricing,
} from "./countdown";
import { LTD_TIER_CONTENT, STANDARD_ANNUAL_PRICES } from "./types";

describe("getCountdownParts", () => {
  it("breaks down remaining time into d/h/m/s", () => {
    const endsAt = "2026-12-01T00:00:00.000Z";
    const now = Date.parse("2026-11-28T10:05:07.000Z");
    const parts = getCountdownParts(endsAt, now);
    assert.equal(parts.expired, false);
    assert.equal(parts.days, 2);
    assert.equal(parts.hours, 13);
    assert.equal(parts.minutes, 54);
    assert.equal(parts.seconds, 53);
  });

  it("marks expired at and after deadline (no localStorage reset)", () => {
    const endsAt = "2026-12-01T00:00:00.000Z";
    assert.equal(getCountdownParts(endsAt, Date.parse(endsAt)).expired, true);
    assert.equal(
      getCountdownParts(endsAt, Date.parse(endsAt) + 1000).totalMs,
      0,
    );
  });

  it("treats missing/invalid deadline as expired", () => {
    assert.equal(getCountdownParts(null).expired, true);
    assert.equal(getCountdownParts("not-a-date").expired, true);
  });

  it("pads values for display", () => {
    assert.equal(pad2(3), "03");
    assert.equal(pad2(12), "12");
  });
});

describe("LTD vs annual mode helpers", () => {
  it("shows LTD only when ACTIVE and purchasable", () => {
    assert.equal(
      isLtdOfferLive({ status: "ACTIVE", isPurchasable: true }),
      true,
    );
    assert.equal(
      isLtdOfferLive({ status: "ACTIVE", isPurchasable: false }),
      false,
    );
    assert.equal(
      isLtdOfferLive({ status: "EXPIRED", isPurchasable: false }),
      false,
    );
  });

  it("falls back to annual for EXPIRED, DISABLED, SCHEDULED, missing", () => {
    assert.equal(shouldShowAnnualPricing(null), true);
    assert.equal(
      shouldShowAnnualPricing({ status: "EXPIRED", isPurchasable: false }),
      true,
    );
    assert.equal(
      shouldShowAnnualPricing({ status: "DISABLED", isPurchasable: false }),
      true,
    );
    assert.equal(
      shouldShowAnnualPricing({ status: "SCHEDULED", isPurchasable: false }),
      true,
    );
    assert.equal(
      shouldShowAnnualPricing({ status: "ACTIVE", isPurchasable: true }),
      false,
    );
    assert.equal(
      shouldShowAnnualPricing({
        status: "ACTIVE",
        isPurchasable: true,
        pricingMode: "ANNUAL",
      }),
      true,
    );
  });
});

describe("Phase 7 — server alignment and annual restore helpers", () => {
  it("restores document annual prices", () => {
    assert.deepEqual(STANDARD_ANNUAL_PRICES, {
      PLUS: 84,
      PRO: 120,
      ULTRA: 156,
    });
  });

  it("aligns local now using serverTime skew", () => {
    const serverTime = "2026-12-01T00:00:00.000Z";
    const fetchedAt = Date.parse("2026-12-01T00:00:05.000Z");
    const localNow = fetchedAt + 2000;
    // server was 5s behind local at fetch → aligned = local + (server - fetchedAt)
    const aligned = serverAlignedNowMs(serverTime, localNow, fetchedAt);
    assert.equal(aligned, localNow + (Date.parse(serverTime) - fetchedAt));
  });

  it("polls faster near expiry and stops after", () => {
    assert.equal(ltdStatusPollingIntervalMs(0), 0);
    assert.equal(ltdStatusPollingIntervalMs(10_000), 2_000);
    assert.equal(ltdStatusPollingIntervalMs(45_000), 5_000);
    assert.equal(ltdStatusPollingIntervalMs(10 * 60_000), 30_000);
  });

  it("marks countdown expired at exact endsAt and +1s", () => {
    const endsAt = "2026-12-01T00:00:00.000Z";
    const endMs = Date.parse(endsAt);
    assert.equal(getCountdownParts(endsAt, endMs - 1000).expired, false);
    assert.equal(getCountdownParts(endsAt, endMs).expired, true);
    assert.equal(getCountdownParts(endsAt, endMs + 1000).expired, true);
  });
});

describe("LTD tier content vs document entitlements", () => {
  it("defines Plus / Pro / Ultra with document feature counts", () => {
    assert.equal(LTD_TIER_CONTENT.length, 3);
    assert.equal(LTD_TIER_CONTENT[0]?.tier, "PLUS");
    assert.equal(LTD_TIER_CONTENT[0]?.featureKeys.length, 4);
    assert.equal(LTD_TIER_CONTENT[1]?.tier, "PRO");
    assert.equal(LTD_TIER_CONTENT[1]?.highlight, true);
    assert.equal(LTD_TIER_CONTENT[1]?.featureKeys.length, 5);
    assert.equal(LTD_TIER_CONTENT[2]?.tier, "ULTRA");
    assert.equal(LTD_TIER_CONTENT[2]?.featureKeys.length, 5);
  });

  it("maps Ultra features to AI Assistant / Navigator / Audit Lens / Benchmark", () => {
    const ultra = LTD_TIER_CONTENT.find((t) => t.tier === "ULTRA");
    assert.ok(ultra);
    assert.ok(ultra!.featureKeys.some((k) => k.includes("Assistant")));
    assert.ok(ultra!.featureKeys.some((k) => k.includes("Navigator")));
    assert.ok(ultra!.featureKeys.some((k) => k.includes("Audit")));
    assert.ok(ultra!.featureKeys.some((k) => k.includes("Benchmark")));
  });
});

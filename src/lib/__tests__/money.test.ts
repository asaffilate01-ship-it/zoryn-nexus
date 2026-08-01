import { describe, expect, it } from "vitest";
import { MAX_CENTS, money } from "../zoryn-mutations.server";

describe("money conversion", () => {
  it("converts cents to euro with two decimals", () => {
    expect(money(1)).toBe(0.01);
    expect(money(2499)).toBe(24.99);
    expect(money(100000)).toBe(1000);
  });

  it("does not accumulate float drift", () => {
    let total = 0;
    for (let i = 0; i < 3; i += 1) total = Number((total + money(1010)).toFixed(2));
    expect(total).toBe(30.3);
  });

  it("caps demo movements at EUR 5,000", () => {
    expect(MAX_CENTS).toBe(500000);
  });
});

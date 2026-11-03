import { describe, expect, test } from "bun:test";
import { swipeDestination } from "./dashboard-swipe";
import { computeRanking } from "./ranking";

describe("dashboard navigation", () => {
  test("horizontal swipes change only the adjacent tab", () => {
    expect(swipeDestination("overview", -100, 10, 250)).toBe("matches");
    expect(swipeDestination("matches", 100, 10, 250)).toBe("overview");
    expect(swipeDestination("analytics", -100, 0, 250)).toBe("analytics");
  });
  test("scrolling and short or slow touches never change tabs", () => {
    expect(swipeDestination("overview", -90, 100, 200)).toBe("overview");
    expect(swipeDestination("overview", -30, 0, 200)).toBe("overview");
    expect(swipeDestination("overview", -100, 0, 900)).toBe("overview");
  });
});

test("regular status restores ranking without changing match records or the 30% rule", () => {
  const results = [{ player_id: "sumon", position: 1 }, { player_id: "sumon", position: 2 }, { player_id: "sumon", position: 3 }];
  const original = JSON.stringify(results);
  const regular = computeRanking([{ id: "sumon", name: "Sumon", is_irregular: false }], results, 10)[0];
  const irregular = computeRanking([{ id: "sumon", name: "Sumon", is_irregular: true }], results, 10)[0];
  expect(regular?.eligible).toBe(true);
  expect(regular?.avgPoints).toBe(3);
  expect(irregular?.eligible).toBe(false);
  expect(irregular?.totalPoints).toBe(9);
  expect(JSON.stringify(results)).toBe(original);
});
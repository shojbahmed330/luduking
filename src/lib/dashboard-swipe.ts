export const DASHBOARD_TABS = ["overview", "matches", "leaderboard", "money", "chanasta", "dues", "analytics"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export function swipeDestination(tab: DashboardTab, dx: number, dy: number, elapsed: number): DashboardTab {
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8 || elapsed > 700) return tab;
  const next = DASHBOARD_TABS.indexOf(tab) + (dx < 0 ? 1 : -1);
  return DASHBOARD_TABS[next] ?? tab;
}

export const SWIPE_EXCLUDED = 'button, a, input, select, textarea, [role="slider"], [role="switch"], [role="combobox"], [data-no-swipe], .recharts-wrapper, svg, canvas';
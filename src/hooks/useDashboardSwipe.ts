import { useRef, type TouchEvent } from "react";
import { SWIPE_EXCLUDED, swipeDestination, type DashboardTab } from "@/lib/dashboard-swipe";

export function useDashboardSwipe(tab: DashboardTab, onChange: (tab: DashboardTab) => void) {
  const start = useRef<{ x: number; y: number; time: number } | null>(null);
  return {
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      start.current = null;
      if (event.touches.length !== 1 || !(event.target instanceof Element) || event.target.closest(SWIPE_EXCLUDED)) return;
      const touch = event.touches[0];
      if (!touch) return;
      // Leave the browser's edge-back gesture alone.
      if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
      start.current = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    },
    onTouchMove(event: TouchEvent<HTMLDivElement>) {
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch || !start.current) { start.current = null; return; }
      if (Math.abs(touch.clientY - start.current.y) > 30 && Math.abs(touch.clientY - start.current.y) > Math.abs(touch.clientX - start.current.x)) start.current = null;
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      start.current = null;
      const touch = event.changedTouches[0];
      if (!origin || !touch) return;
      onChange(swipeDestination(tab, touch.clientX - origin.x, touch.clientY - origin.y, performance.now() - origin.time));
    },
    onTouchCancel() { start.current = null; },
  };
}
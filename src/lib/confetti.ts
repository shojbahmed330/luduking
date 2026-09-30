import confetti from "canvas-confetti";

const LUDU_COLORS = ["#F5B301", "#34B85B", "#4C8DF7", "#F05656"];

/** Small celebratory burst — used after a successful save. */
export function fireConfetti() {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.7 },
    colors: LUDU_COLORS,
    disableForReducedMotion: true,
  });
}

/** Bigger two-sided burst — used for champion announcements. */
export function fireChampionConfetti() {
  const base = { colors: LUDU_COLORS, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
  confetti({ ...base, particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
}

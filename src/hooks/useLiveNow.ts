import { useEffect, useState } from "react";

/**
 * Keeps the current timestamp fresh once per second while the caller needs
 * live elapsed-time labels. The interval is paused when the content is hidden.
 */
export function useLiveNow(enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    const updateNow = () => setNow(Date.now());
    updateNow();

    const intervalId = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(intervalId);
  }, [enabled]);

  return now;
}

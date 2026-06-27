"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight, no-auth identity: the name a user picks for themselves, stored
 * in localStorage. Used to attribute reactions and comments. Changes are
 * broadcast via a custom event so every mounted component stays in sync.
 */

const KEY = "sweepstake:me";
const EVENT = "sweepstake:identity";

export function useIdentity(): [string | null, (name: string | null) => void] {
  // Start null on the server and first client render to avoid hydration
  // mismatch; hydrate from localStorage in the effect below.
  const [me, setMeState] = useState<string | null>(null);

  useEffect(() => {
    setMeState(localStorage.getItem(KEY));
    const sync = () => setMeState(localStorage.getItem(KEY));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMe = useCallback((name: string | null) => {
    if (name) localStorage.setItem(KEY, name);
    else localStorage.removeItem(KEY);
    setMeState(name);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [me, setMe];
}

import { useEffect, useRef } from "react";

export const useClickOutside = <T extends HTMLElement>(handler: () => void) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (e.button == 0 && ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
    };
  }, [handler]);

  return ref;
};

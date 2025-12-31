import React, { useState } from "react";

export const useModeSwitcher = <T>(
  keys: readonly string[],
  map: Record<string, T>,
  defaultMode: T,
) => {
  const [mode, setMode] = useState<T>(defaultMode);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " ") {
        event.preventDefault();
    }
    if (keys.includes(event.key)) {
      setMode(map[event.key]);
    }
  };

  return { mode, setMode, handleKeyDown };
};

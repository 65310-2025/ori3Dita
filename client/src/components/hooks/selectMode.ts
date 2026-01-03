import React, { useEffect, useState } from "react";

import { Edge } from "../../types/cp";
import { Mode } from "../../types/ui";

export const useSelectMode = (mode: Mode) => {
  const [selection, setSelection] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== Mode.Selecting) {
      setSelection([]);
    }
  }, [mode]);

  const edgeOnClick = (event: React.PointerEvent<SVGPathElement>, e: Edge) => {
    if (event.button !== 0) {
      return;
    }
    event.stopPropagation();
    if (selection.includes(e.id)) {
      setSelection([]);
    } else {
      setSelection([e.id]);
    }
  };

  return { selection, setSelection, edgeOnClick };
};

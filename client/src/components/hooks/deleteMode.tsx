import React, { useEffect, useRef } from "react";

import { CP, Point } from "../../types/cp";
import { Mode } from "../../types/ui";
import { deleteBox } from "../../utils/cpEdit";
import { useDrag } from "./drag";

export const useDeleteMode = (
  cp: CP | null,
  setCP: (cp: CP) => void,
  mode: Mode,
) => {
  const boxRef = useRef<SVGRectElement | null>(null);
  const ui = <rect ref={boxRef} className="Delete-box" />;

  const onMove = (start: Point, end: Point) => {
    boxRef.current?.setAttribute("width", `${Math.abs(start.x - end.x)}`);
    boxRef.current?.setAttribute("height", `${Math.abs(start.y - end.y)}`);
    boxRef.current?.setAttribute("x", `${Math.min(start.x, end.x)}`);
    boxRef.current?.setAttribute("y", `${Math.min(start.y, end.y)}`);
  };

  const reset = () => {
    boxRef.current?.setAttribute("width", "0");
    boxRef.current?.setAttribute("height", "0");
  };

  const dragHandler = useDrag(
    onMove,
    (start: Point, end: Point) => {
      if (cp === null) return;
      setCP(deleteBox(cp, start, end));
    },
    reset,
  );

  useEffect(() => {
    if (mode !== Mode.Deleting) {
      dragHandler.cleanup();
    }
  }, [mode]);

  return { ui, ...dragHandler };
};

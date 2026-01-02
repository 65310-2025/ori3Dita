import React, { useEffect, useRef } from "react";

import { CP, Point } from "../../types/cp";
import { Mode, MvMode } from "../../types/ui";
import { addEdge, getSnapPoints, snapVertex } from "../../utils/cpEdit";

export const useDrawMode = (
  cp: CP | null,
  setCP: (cp: CP) => void,
  mvMode: MvMode,
  mode: Mode,
) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const penStart = useRef<Point | null>(null);
  const penEnd = useRef<Point | null>(null);

  useEffect(() => {
    if (mode !== Mode.Drawing) {
      pathRef.current?.setAttribute("d", "");
      penStart.current = null;
      penEnd.current = null;
    }
  }, [mode]);

  const getPoint = (
    e: React.PointerEvent<SVGSVGElement>,
    svg: SVGSVGElement,
  ) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 || cp === null) {
      return;
    }
    const svg = e.currentTarget;
    const { x, y } = getPoint(e, svg);
    penStart.current = snapVertex(getSnapPoints(cp), x, y) || { x: x, y: y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const curState = penStart.current;
    if (!curState || !cp) return;

    const svg = e.currentTarget;
    const { x, y } = getPoint(e, svg);
    const point = snapVertex(getSnapPoints(cp), x, y) || { x: x, y: y };
    pathRef.current?.setAttribute(
      "d",
      `M${curState.x} ${curState.y} L ${point.x} ${point.y}`,
    );
    penEnd.current = point;
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const start = penStart.current;
    const end = penEnd.current;
    pathRef.current?.setAttribute("d", "");
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (start === null || end === null || cp === null) {
      return;
    }
    setCP(addEdge(cp, start, end, mvMode));
    penStart.current = null;
    penEnd.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      pathRef.current?.setAttribute("d", "");
      penStart.current = null;
      penEnd.current = null;
    }
  };

  return { pathRef, onPointerDown, onPointerMove, onPointerUp, onKeyDown };
};

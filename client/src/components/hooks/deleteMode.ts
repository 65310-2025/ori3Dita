import React, { useEffect, useRef } from "react";

import { CP, Point } from "../../types/cp";
import { Mode } from "../../types/ui";
import { deleteBox } from "../../utils/cpEdit";

export const useDeleteMode = (
  cp: CP | null,
  setCP: (cp: CP) => void,
  mode: Mode,
) => {
  const boxRef = useRef<SVGRectElement | null>(null);
  const penStart = useRef<Point | null>(null);
  const penEnd = useRef<Point | null>(null);

  const cleanup = () => {
    penStart.current = null;
    penEnd.current = null;
    boxRef.current?.setAttribute("width", "0");
    boxRef.current?.setAttribute("height", "0");
  };

  useEffect(() => {
    if (mode !== Mode.Deleting) {
      cleanup();
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
    penStart.current = getPoint(e, svg);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const curState = penStart.current;
    if (!curState || !cp) return;

    const svg = e.currentTarget;
    const point = getPoint(e, svg);
    boxRef.current?.setAttribute("width", `${Math.abs(curState.x - point.x)}`);
    boxRef.current?.setAttribute("height", `${Math.abs(curState.y - point.y)}`);
    boxRef.current?.setAttribute("x", `${Math.min(curState.x, point.x)}`);
    boxRef.current?.setAttribute("y", `${Math.min(curState.y, point.y)}`);
    penEnd.current = point;
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const start = penStart.current;
    const end = penEnd.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (start === null || end === null || cp === null) {
      return;
    }
    setCP(deleteBox(cp, start, end));
    cleanup();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cleanup();
    }
  };

  return { boxRef, onPointerDown, onPointerMove, onPointerUp, onKeyDown };
};

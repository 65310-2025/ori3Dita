import React, { useRef } from "react";

import { Point } from "../../types/cp";

export const useDrag = (
  onMove: (start: Point, end: Point) => void,
  submit: (start: Point, end: Point) => void,
  reset: () => void,
  button: number = 0,
) => {
  const penStart = useRef<Point | null>(null);
  const penEnd = useRef<Point | null>(null);

  const cleanup = () => {
    penStart.current = null;
    penEnd.current = null;
    reset();
  };

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
    if (e.button !== button) return;
    const svg = e.currentTarget;
    penStart.current = getPoint(e, svg);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const curState = penStart.current;
    if (!curState) return;
    const svg = e.currentTarget;
    const point = getPoint(e, svg);
    onMove(curState, point);
    penEnd.current = point;
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const start = penStart.current;
    const end = penEnd.current;
    e.currentTarget.releasePointerCapture(e.pointerId);
    cleanup();
    if (start === null || end === null) return;
    submit(start, end);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cleanup();
    }
  };

  return { cleanup, onPointerDown, onPointerMove, onPointerUp, onKeyDown };
};

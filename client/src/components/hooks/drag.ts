import React, { useRef } from "react";

import { Point } from "../../types/cp";

export interface UseDragOptions {
  button?: number;
  transformStart?: (start: Point) => Point | null;
}

export const useDrag = (
  onMove: (start: Point, end: Point) => void,
  submit: (start: Point, end: Point) => void,
  reset: () => void,
  buttonOrOptions: number | UseDragOptions = 0,
) => {
  const button =
    typeof buttonOrOptions === "number"
      ? buttonOrOptions
      : (buttonOrOptions.button ?? 0);
  const transformStart =
    typeof buttonOrOptions === "number"
      ? undefined
      : buttonOrOptions.transformStart;

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

    const rawStart = getPoint(e, svg);
    const start = transformStart ? transformStart(rawStart) : rawStart;
    if (start === null) return;

    penStart.current = start;
    penEnd.current = null;
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
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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

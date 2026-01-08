import React, { useEffect, useRef } from "react";

import { CP, Point } from "../../types/cp";
import { Mode, MvMode } from "../../types/ui";
import { addEdge } from "../../utils/cpEdit";
import { useDrag } from "./drag";

const SNAP_TOLERANCE = 0.03;

export interface GridSnapConfig {
  enabled: boolean;
  gridSize: number;
  extend: boolean;
}

export const useDrawMode = (
  cp: CP | null,
  setCP: (cp: CP) => void,
  mvMode: MvMode,
  mode: Mode,
  gridSnap?: GridSnapConfig,
) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const ui = <path ref={pathRef} className={`Edge Edge-${mvMode} Pen-path`} />;

  const distance = (p1: Point, p2: Point) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const snapToCPVertex = (point: Point): Point | null => {
    if (cp === null) return null;
    return cp.vertices.find((p) => distance(p, point) <= SNAP_TOLERANCE) ?? null;
  };

  const snapToCPMidpoint = (point: Point): Point | null => {
    if (cp === null) return null;
    for (const edge of cp.edges) {
      const mid = {
        x: (edge.vertex1.x + edge.vertex2.x) / 2,
        y: (edge.vertex1.y + edge.vertex2.y) / 2,
      };
      if (distance(mid, point) <= SNAP_TOLERANCE) {
        return mid;
      }
    }
    return null;
  };

  const snapToGrid = (point: Point): Point | null => {
    if (!gridSnap?.enabled) return null;
    const n = Math.max(1, Math.round(gridSnap.gridSize));
    const step = 1 / n;

    const snapped = {
      x: Math.round(point.x / step) * step,
      y: Math.round(point.y / step) * step,
    };
    if (!gridSnap.extend) {
      if (snapped.x < 0 || snapped.x > 1 || snapped.y < 0 || snapped.y > 1) {
        return null;
      }
    }
    return distance(snapped, point) <= SNAP_TOLERANCE ? snapped : null;
  };

  const snapRequired = (point: Point): Point | null => {
    // Prefer existing CP vertices first (avoids “ghost” grid duplicates)
    return snapToCPVertex(point) ?? snapToCPMidpoint(point) ?? snapToGrid(point);
  };

  const clearPath = () => {
    pathRef.current?.setAttribute("d", "");
  };

  const onMove = (start: Point, end: Point) => {
    if (cp === null) return;
    const snapEnd = snapRequired(end);
    const endPoint = snapEnd ?? end;
    pathRef.current?.setAttribute(
      "d",
      `M${start.x} ${start.y} L ${endPoint.x} ${endPoint.y}`,
    );
  };

  const submit = (start: Point, end: Point) => {
    if (cp === null) return;
    const snapEnd = snapRequired(end);
    if (snapEnd === null) return;
    setCP(addEdge(cp, start, snapEnd, mvMode));
  };

  const dragHandler = useDrag(onMove, submit, clearPath, {
    transformStart: snapRequired,
  });

  useEffect(() => {
    if (mode !== Mode.Drawing) {
      dragHandler.cleanup();
    }
  }, [mode]);

  return { ui, ...dragHandler };
};

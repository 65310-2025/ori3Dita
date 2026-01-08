import React, { useEffect, useRef } from "react";

import { CP, Point } from "../../types/cp";
import { Mode, MvMode } from "../../types/ui";
import { addEdge } from "../../utils/cpEdit";
import {
  DRAW_PREVIEW_DOT_RADIUS_PX,
  DRAW_SNAP_TOLERANCE_PX,
} from "../tuning/editorTuning";
import { useDrag } from "./drag";
import { ViewBox } from "./panZoom";

const FALLBACK_SNAP_TOLERANCE_WORLD = 0.03;

interface CanvasSize {
  width: number;
  height: number;
}

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
  viewBox: ViewBox,
  canvasSize: CanvasSize,
  gridSnap?: GridSnapConfig,
) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);

  const getWorldPerPx = (): number => {
    const widthWorld = 1 / viewBox.zoom;
    const heightWorld = 1 / viewBox.zoom;

    const scalePx = Math.min(canvasSize.width, canvasSize.height);
    if (!Number.isFinite(scalePx) || scalePx <= 0) {
      return 0;
    }

    // Match SVG's default preserveAspectRatio behavior (uniform scale).
    const viewBoxWorldSize = Math.max(widthWorld, heightWorld);
    return viewBoxWorldSize / scalePx;
  };

  const snapToleranceWorld = (() => {
    const worldPerPx = getWorldPerPx();
    if (worldPerPx <= 0) return FALLBACK_SNAP_TOLERANCE_WORLD;
    return DRAW_SNAP_TOLERANCE_PX * worldPerPx;
  })();

  const previewDotRadiusWorld = (() => {
    const worldPerPx = getWorldPerPx();
    if (worldPerPx <= 0) return 0;
    return DRAW_PREVIEW_DOT_RADIUS_PX * worldPerPx;
  })();

  const ui = (
    <>
      <path ref={pathRef} className={`Edge Edge-${mvMode} Pen-path`} />
      <circle
        ref={dotRef}
        className={`Pen-previewDot Pen-previewDot-${mvMode}`}
        r={0}
      />
    </>
  );

  const distance = (p1: Point, p2: Point) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const snapToCPVertex = (point: Point): Point | null => {
    if (cp === null) return null;
    return (
      cp.vertices.find((p) => distance(p, point) <= snapToleranceWorld) ?? null
    );
  };

  const snapToCPMidpoint = (point: Point): Point | null => {
    if (cp === null) return null;
    for (const edge of cp.edges) {
      const mid = {
        x: (edge.vertex1.x + edge.vertex2.x) / 2,
        y: (edge.vertex1.y + edge.vertex2.y) / 2,
      };
      if (distance(mid, point) <= snapToleranceWorld) {
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
    return distance(snapped, point) <= snapToleranceWorld ? snapped : null;
  };

  const snapRequired = (point: Point): Point | null => {
    // Prefer existing CP vertices first (avoids “ghost” grid duplicates)
    return snapToCPVertex(point) ?? snapToCPMidpoint(point) ?? snapToGrid(point);
  };

  const clearPath = () => {
    pathRef.current?.setAttribute("d", "");
    dotRef.current?.setAttribute("r", "0");
  };

  const onMove = (start: Point, end: Point) => {
    if (cp === null) return;
    const snapEnd = snapRequired(end);
    const endPoint = snapEnd ?? end;
    pathRef.current?.setAttribute(
      "d",
      `M${start.x} ${start.y} L ${endPoint.x} ${endPoint.y}`,
    );

    if (snapEnd && previewDotRadiusWorld > 0) {
      dotRef.current?.setAttribute("cx", `${snapEnd.x}`);
      dotRef.current?.setAttribute("cy", `${snapEnd.y}`);
      dotRef.current?.setAttribute("r", `${previewDotRadiusWorld}`);
    } else {
      dotRef.current?.setAttribute("r", "0");
    }
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

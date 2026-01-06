import React, { useEffect, useRef } from "react";

import { CP, Edge, Point } from "../../types/cp";
import { Mode } from "../../types/ui";
import { flipAssignment } from "../../utils/cp";
import { edgeInBox } from "../../utils/cpEdit";
import { useDrag } from "./drag";

export const useChangeMvMode = (
  cp: CP | null,
  setCP: (cp: CP) => void,
  mode: Mode,
) => {
  const boxRef = useRef<SVGRectElement | null>(null);
  const ui = <rect ref={boxRef} className="ChangeMv-box" />;

  const onMove = (start: Point, end: Point) => {
    boxRef.current?.setAttribute("width", `${Math.abs(start.x - end.x)}`);
    boxRef.current?.setAttribute("height", `${Math.abs(start.y - end.y)}`);
    boxRef.current?.setAttribute("x", `${Math.min(start.x, end.x)}`);
    boxRef.current?.setAttribute("y", `${Math.min(start.y, end.y)}`);
  };

  const submit = (start: Point, end: Point) => {
    if (cp === null) return;
    const newCp = {
      vertices: [...cp.vertices],
      edges: cp.edges.map((e: Edge) => {
        if (edgeInBox(e, start, end)) {
          return {
            ...e,
            foldAngle: -e.foldAngle,
            assignment: flipAssignment(e.assignment),
          };
        }
        return e;
      }),
    };
    setCP(newCp);
  };

  const reset = () => {
    boxRef.current?.setAttribute("width", "0");
    boxRef.current?.setAttribute("height", "0");
  };

  const dragHandler = useDrag(onMove, submit, reset);

  const edgeOnClick = (
    event: React.PointerEvent<SVGPathElement>,
    edge: Edge,
  ) => {
    if (event.button !== 0 || cp === null) return;
    const newCp = {
      vertices: [...cp.vertices],
      edges: cp.edges.map((e: Edge) => {
        if (e.id === edge.id) {
          return {
            ...e,
            foldAngle: -e.foldAngle,
            assignment: flipAssignment(e.assignment),
          };
        }
        return e;
      }),
    };
    setCP(newCp);
  };

  useEffect(() => {
    if (mode !== Mode.ChangeMV) {
      dragHandler.cleanup();
    }
  }, [mode]);

  return { ui, ...dragHandler, edgeOnClick };
};

import { CP, Edge, EdgeAssignment, Point } from "../types/cp";
import { MvMode } from "../types/ui";
import { isEndpoint, pointsEqual } from "./cp";
import { intersectSegments, onSegment } from "./geometry";

const SNAP_TOLERANCE = 0.03;

export const getSnapPoints = (cp: CP) => {
  return [
    ...cp.vertices,
    ...cp.edges.map((e: Edge) => {
      return {
        x: (e.vertex1.x + e.vertex2.x) / 2,
        y: (e.vertex1.y + e.vertex2.y) / 2,
      };
    }),
  ];
};

export const snapVertex = (cp: CP, x: number, y: number) => {
  const snapPoints = getSnapPoints(cp);

  const distance = (point: Point) => {
    return Math.sqrt(
      (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y),
    );
  };

  return snapPoints.find((point: Point) => distance(point) <= SNAP_TOLERANCE);
};

export const addEdge = (
  cp: CP,
  vertex1: Point,
  vertex2: Point,
  mvMode: MvMode,
): CP => {
  if (pointsEqual(vertex1, vertex2)) {
    return cp;
  }
  const newVertices = [...cp.vertices];

  const addPoint = (point: Point, arr: Point[]) => {
    if (!arr.some((p) => pointsEqual(point, p))) {
      arr.push(point);
    }
  };

  addPoint(vertex1, newVertices);
  addPoint(vertex2, newVertices);

  const foldAngle =
    mvMode === MvMode.Mountain
      ? -Math.PI
      : mvMode === MvMode.Valley
        ? Math.PI
        : 0;

  const newEdges: Edge[] = [];
  const breakPoints = [vertex1, vertex2];
  cp.edges.forEach((edge: Edge) => {
    const intersection = intersectSegments(
      edge.vertex1,
      edge.vertex2,
      vertex1,
      vertex2,
    );

    if (intersection === null) {
      newEdges.push(edge);
    } else if (intersection === undefined) {
      [edge.vertex1, edge.vertex2].forEach((p: Point) => {
        if (onSegment(vertex1, vertex2, p)) {
          if (!pointsEqual(p, vertex1) && !pointsEqual(p, vertex2)) {
            addPoint(p, breakPoints);
          }
        } else if (onSegment(p, vertex1, vertex2)) {
          newEdges.push({
            ...edge,
            vertex1: p,
            vertex2: vertex2,
            id: crypto.randomUUID(),
          });
        } else if (onSegment(p, vertex2, vertex1)) {
          newEdges.push({
            ...edge,
            vertex1: p,
            vertex2: vertex1,
            id: crypto.randomUUID(),
          });
        }
      });
    } else {
      addPoint(intersection, newVertices);
      if (!isEndpoint(edge, intersection)) {
        newEdges.push({
          ...edge,
          vertex2: intersection,
          id: crypto.randomUUID(),
        });
        newEdges.push({
          ...edge,
          vertex1: intersection,
          id: crypto.randomUUID(),
        });
      } else {
        newEdges.push(edge);
      }
      if (!isEndpoint({ vertex1, vertex2 }, intersection)) {
        addPoint(intersection, breakPoints);
      }
    }
  });

  breakPoints.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  breakPoints.forEach((p: Point, idx: number) => {
    if (idx < breakPoints.length - 1) {
      newEdges.push({
        vertex1: p,
        vertex2: breakPoints[idx + 1],
        assignment: mvMode as unknown as EdgeAssignment,
        foldAngle: foldAngle,
        id: crypto.randomUUID(),
      });
    }
  });

  console.log(newVertices);
  console.log(newEdges);

  return {
    vertices: newVertices,
    edges: newEdges,
  };
};

export const deleteEdge = (cp: CP, edgeId: string): CP => {
  const newEdges = cp.edges.filter((e: Edge) => e.id !== edgeId);
  const newVertices = [
    ...newEdges.map((e: Edge) => e.vertex1),
    ...newEdges.map((e: Edge) => e.vertex2),
  ];
  return {
    edges: newEdges,
    vertices: [...new Set(newVertices)],
  };
};

export const deleteBox = (cp: CP, corner1: Point, corner2: Point): CP => {
  const minX = Math.min(corner1.x, corner2.x),
    maxX = Math.max(corner1.x, corner2.x);
  const minY = Math.min(corner1.y, corner2.y),
    maxY = Math.max(corner1.y, corner2.y);

  const inBox = (p: Point) => {
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  };

  const newEdges = cp.edges.filter((e: Edge) => {
    if (inBox(e.vertex1) || inBox(e.vertex2)) {
      return false;
    }
    const box = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
    return !box.some((p: Point, ind: number) => {
      return (
        intersectSegments(p, box[(ind + 1) % 4], e.vertex1, e.vertex2) !== null
      );
    });
  });
  const newVertices = [
    ...newEdges.map((e: Edge) => e.vertex1),
    ...newEdges.map((e: Edge) => e.vertex2),
  ];

  return {
    edges: newEdges,
    vertices: [...new Set(newVertices)],
  };
};

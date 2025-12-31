import { CP, Point } from "../types/cp";
import { MvMode } from "../types/ui";

const SNAP_TOLERANCE = 0.015;

export const getSnapPoints = (cp: CP) => {
  return cp.vertices;
};

export const snapVertex = (snapPoints: Point[], x: number, y: number) => {
  const distance = (point: Point) => {
    return Math.sqrt(
      (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y),
    );
  };

  return snapPoints.find((point: Point) => distance(point) <= SNAP_TOLERANCE);
};

// Compute the cross product of \vec{AB} and \vec{AC}
const cross = (a: Point, b: Point, c: Point) => {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
};

// Compute the intersection of line AB and CD, assumes lines are not parallel
const intersect = (a: Point, b: Point, c: Point, d: Point) => {
  const a1 = b.y - a.y;
  const b1 = a.x - b.x;
  const c1 = a.x * a1 + a.y * b1;
  const a2 = d.y - c.y;
  const b2 = c.x - d.x;
  const c2 = c.x * a2 + c.y * b2;
  const det = a1 * b2 - a2 * b1;
  return { x: (b2 * c1 - b1 * c2) / det, y: (a1 * c2 - a2 * c1) / det };
};

export const addEdge = (
  cp: CP,
  vertex1: Point,
  vertex2: Point,
  mvMode: MvMode,
) => {
  if (vertex1.x === vertex2.x && vertex1.y === vertex2.y) {
    return cp;
  }
  const newVertices = [...cp.vertices];

  const addPoint = (point: Point) => {
    if (!newVertices.some((p) => p.x === point.x && p.y === point.y)) {
      newVertices.push(point);
    }
  };

  addPoint(vertex1);
  addPoint(vertex2);

  const foldAngle =
    mvMode === MvMode.Mountain
      ? Math.PI
      : mvMode === MvMode.Valley
        ? -Math.PI
        : 0;

  const orderEdge = (p1: Point, p2: Point) => {
    const vertical = p1.x === p2.x;
    if (vertical) {
      if (p1.y < p2.y) {
        return { lx: p1.y, rx: p2.y, lp: p1, rp: p2, vertical: vertical };
      } else {
        return { lx: p2.y, rx: p1.y, lp: p2, rp: p1, vertical: vertical };
      }
    }
    if (p1.x < p2.x) {
      return { lx: p1.x, rx: p2.x, lp: p1, rp: p2, vertical: vertical };
    } else {
      return { lx: p2.x, rx: p1.x, lp: p2, rp: p1, vertical: vertical };
    }
  };

  const getParam = (p: Point, vertical: bool) => {
    return vertical ? p.y : p.x;
  };

  const newEdges = [];
  const breakPoints = [vertex1, vertex2];
  const orderNew = orderEdge(vertex1, vertex2);
  cp.edges.forEach((edge: Edge) => {
    const c1 = cross(edge.vertex1, vertex1, edge.vertex2);
    const c2 = cross(edge.vertex1, vertex2, edge.vertex2);
    const c3 = cross(vertex1, edge.vertex1, vertex2);
    const c4 = cross(vertex1, edge.vertex2, vertex2);
    const orderOld = orderEdge(edge.vertex1, edge.vertex2);

    if (Math.sign(c1 * c2) === -1 && Math.sign(c3 * c4) === -1) {
      const intersection = intersect(
        vertex1,
        vertex2,
        edge.vertex1,
        edge.vertex2,
      );
      newEdges.push({
        ...edge,
        vertex1: intersection,
        id: crypto.randomUUID(),
      });
      newEdges.push({
        ...edge,
        vertex2: intersection,
        id: crypto.randomUUID(),
      });
      breakPoints.push(intersection);
      addPoint(intersection);
    } else if (c1 === 0 && c2 === 0) {
      if (orderOld.lx < orderNew.lx && orderOld.rx > orderNew.lx) {
        if (orderOld.rx < orderNew.rx) {
          newEdges.push({
            ...edge,
            vertex1: orderOld.lp,
            vertex2: orderNew.lp,
            id: crypto.randomUUID(),
          });
          breakPoints.push(orderOld.rp);
        } else if (orderOld.rx === orderNew.rx) {
          newEdges.push({
            ...edge,
            vertex1: orderOld.lp,
            vertex2: orderNew.lp,
            id: crypto.randomUUID(),
          });
        } else {
          newEdges.push({
            ...edge,
            vertex1: orderOld.lp,
            vertex2: orderNew.lp,
            id: crypto.randomUUID(),
          });
          newEdges.push({
            ...edge,
            vertex1: orderOld.rp,
            vertex2: orderNew.rp,
            id: crypto.randomUUID(),
          });
        }
      } else if (orderOld.lx > orderNew.lx && orderOld.lx < orderNew.rx) {
        if (orderOld.rx < orderNew.rx) {
          breakPoints.push(orderOld.lp);
          breakPoints.push(orderOld.rp);
        } else if (orderOld.rx == orderNew.rx) {
          breakPoints.push(orderOld.lp);
        } else {
          newEdges.push({
            ...edge,
            vertex1: orderNew.rp,
            vertex2: orderOld.rp,
            id: crypto.randomUUID(),
          });
          breakPoints.push(orderOld.lp);
        }
      } else if (orderOld.lx === orderNew.lx) {
        if (orderOld.rx < orderNew.rx) {
          breakPoints.push(orderOld.rp);
        } else if (orderOld.rx > orderNew.rx) {
          newEdges.push({
            ...edge,
            vertex1: orderNew.rp,
            vertex2: orderOld.rp,
            id: crypto.randomUUID(),
          });
        }
      } else if (orderOld.rx === orderNew.rx) {
        if (orderOld.lx < orderNew.lx) {
          newEdges.push({
            ...edge,
            vertex1: orderOld.lp,
            vertex2: orderNew.lp,
            id: crypto.randomUUID(),
          });
        } else if (orderOld.lx > orderNew.lx) {
          breakPoints.push(orderOld.lp);
        }
      }
    } else if (
      c1 === 0 &&
      getParam(vertex1, orderOld.vertical) > orderOld.lx &&
      getParam(vertex1, orderOld.vertical) < orderOld.rx
    ) {
      newEdges.push({
        ...edge,
        vertex2: vertex1,
        id: crypto.randomUUID(),
      });
      newEdges.push({
        ...edge,
        vertex1: vertex1,
        id: crypto.randomUUID(),
      });
    } else if (
      c2 === 0 &&
      getParam(vertex2, orderOld.vertical) > orderOld.lx &&
      getParam(vertex2, orderOld.vertical) < orderOld.rx
    ) {
      newEdges.push({
        ...edge,
        vertex2: vertex2,
        id: crypto.randomUUID(),
      });
      newEdges.push({
        ...edge,
        vertex1: vertex2,
        id: crypto.randomUUID(),
      });
    } else if (
      c3 === 0 &&
      getParam(edge.vertex1, orderNew.vertical) > orderNew.lx &&
      getParam(edge.vertex1, orderNew.vertical) < orderNew.rx
    ) {
      breakPoints.push(edge.vertex1);
      newEdges.push(edge);
    } else if (
      c4 === 0 &&
      getParam(edge.vertex2, orderNew.vertical) > orderNew.lx &&
      getParam(edge.vertex2, orderNew.vertical) < orderNew.rx
    ) {
      breakPoints.push(edge.vertex2);
      newEdges.push(edge);
    } else {
      newEdges.push(edge);
    }
  });

  breakPoints.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  breakPoints.forEach((p: Point, idx: number) => {
    if (idx < breakPoints.length - 1) {
      newEdges.push({
        vertex1: p,
        vertex2: breakPoints[idx + 1],
        assignment: mvMode as EdgeAssignment,
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

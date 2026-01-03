import { Point } from "../types/cp";

// Compute the cross product of \vec{AB} and \vec{AC}
export const cross = (a: Point, b: Point, c: Point) => {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
};

// Compute the intersection of lines (not line segments!) AB and CD, assumes lines are not parallel
export const getIntersection = (a: Point, b: Point, c: Point, d: Point) => {
  const a1 = b.y - a.y;
  const b1 = a.x - b.x;
  const c1 = a.x * a1 + a.y * b1;
  const a2 = d.y - c.y;
  const b2 = c.x - d.x;
  const c2 = c.x * a2 + c.y * b2;
  const det = a1 * b2 - a2 * b1;
  return { x: (b2 * c1 - b1 * c2) / det, y: (a1 * c2 - a2 * c1) / det };
};

// Determine whether C is on segment AB (assumes A, B, and C are collinear)
export const onSegment = (a: Point, b: Point, c: Point) => {
  return (
    c.x <= Math.max(a.x, b.x) &&
    c.x >= Math.min(a.x, b.x) &&
    c.y <= Math.max(a.y, b.y) &&
    c.y >= Math.min(a.y, b.y)
  );
};

export const intersectSegments = (
  a: Point,
  b: Point,
  c: Point,
  d: Point,
): Point | null | undefined => {
  const c1 = cross(a, b, c);
  const c2 = cross(a, b, d);
  const c3 = cross(c, d, a);
  const c4 = cross(c, d, b);

  if (Math.sign(c1 * c2) === -1 && Math.sign(c3 * c4) === -1) {
    return getIntersection(a, b, c, d);
  }
  if (c1 === 0 && c2 === 0 && (onSegment(a, b, c) || onSegment(a, b, d))) {
    return undefined;
  }
  if (c1 === 0 && onSegment(a, b, c)) {
    return c;
  }
  if (c2 === 0 && onSegment(a, b, d)) {
    return d;
  }
  if (c3 === 0 && onSegment(c, d, a)) {
    return a;
  }
  if (c4 === 0 && onSegment(c, d, b)) {
    return b;
  }
  return null;
};

export interface Point {
  coords: [number, number];
}

export enum EdgeAssignment {
  Mountain = "M",
  Valley = "V",
  Border = "B",
  Aux = "A",
  Flat = "F",
  Cut = "C",
  Join = "J",
}

export interface Edge {
  vertex1: Point;
  vertex2: Point;
  assignment: EdgeAssignment;
  fold_angle: number; // Positive for valley, negative for mountain, 0 for everything else. Import and export as degrees [-180,180] but internally use radians [-pi,pi]. Should match with edges_assignment
}

export interface CP {
  vertices: Array<Point>; // coordinates on the crease pattern
  edges: Array<Edge>;
}

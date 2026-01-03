import { Edge, Point } from "./cp";

export type Point3D = [number, number, number];

export interface Face {
  border: Point[];
  edges: Edge[];
  id: string;
}

export interface FoldedFace {
  border: Point3D[];
  id: string;
}

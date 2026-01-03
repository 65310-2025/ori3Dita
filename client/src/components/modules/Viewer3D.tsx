import React, { useMemo } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { CP } from "../../types/cp";
import { FoldedFace } from "../../types/xray";
import { findFaces, foldFaces } from "../../utils/xray";
import Polygon3D from "./Polygon";
import "./Viewer3D.css";

export interface Viewer3DProps {
  cp: CP | null;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ cp }) => {
  const foldedFaces = useMemo(() => {
    if (cp === null) return [];
    return foldFaces(findFaces(cp), cp);
  }, [cp]);

  return (
    <div className="Viewer">
      <Canvas>
        {foldedFaces.map((f: FoldedFace) => (
          <Polygon3D key={`Face-${f.id}`} vertices={f.border} />
        ))}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

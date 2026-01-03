/* eslint-disable react/no-unknown-property */
import React, { useMemo } from "react";

import * as THREE from "three";

import { Point3D } from "../../types/xray";

type Polygon3DProps = {
  vertices: Point3D[];
};

const Polygon3D = ({ vertices }: Polygon3DProps) => {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();

    const positions = new Float32Array(vertices.flat());
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const indices: number[] = [];
    for (let i = 1; i < vertices.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }, [vertices]);

  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(geometry),
    [geometry],
  );

  return (
    <group>
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial
          attach="material"
          color={0x00ffff}
          transparent
          opacity={0.2}
          side={THREE.FrontSide}
        />
      </mesh>
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial
          attach="material"
          color={0xffff00}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      <lineSegments>
        <primitive object={edgesGeometry} attach="geometry" />
        <lineBasicMaterial attach="material" color={0x000000} />
      </lineSegments>
    </group>
  );
};

export default Polygon3D;

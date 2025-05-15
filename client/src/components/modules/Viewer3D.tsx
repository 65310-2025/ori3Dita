import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Fold } from "../../types/fold";
import { getFaces,getFoldedFaces, projectTo2D } from "../../utils/xray";


import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export interface Viewer3DProps {
  cp: Fold|null; // Replace 'any' with the appropriate type for 'cp'
  setCP: (cp: Fold) => void;
  cpRef: RefObject<Fold | null>;
}

const polygon3D = (vertices:[number,number,number][]) => {
  // Create a geometry from a set of vertices. Assume the vertices are in 3d space and are in circular order for easy triangulation. 
  const geometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(vertices.flat());
  geometry.setAttribute("position", new THREE.BufferAttribute(verticesArray, 3));
  const indices = [];
  for (let i = 1; i < vertices.length - 1; i++) {
    indices.push(0, i, i + 1);
  }
  geometry.setIndex(indices);
  const front = new THREE.Mesh(geometry, faceMaterial);
  const back = new THREE.Mesh(geometry, faceMaterialBack);
  const polygon = new THREE.Group();
  polygon.add(front);
  polygon.add(back);
  // Create an outline for the polygon
  const edges = new THREE.EdgesGeometry(geometry);
  const outline = new THREE.LineSegments(edges, lineMaterial);
  polygon.add(outline);
  return polygon;
}
const isClockwise = (pts: [number, number][]) => {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    sum += (x2 - x1) * (y2 + y1);
  }
  return sum > 0;
};
const downloadSVG = (projectedFaces: [number,number][][]) => {
  // Create an SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "500");
  svg.setAttribute("height", "500");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Create a group for the polygons
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", "translate(250,250)"); // Center the polygons

  // Find the bounding box of all points
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  projectedFaces.forEach(face => {
    face.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
  });

  // Compute scale factor to fit faces within 500x500 (with some padding)
  const padding = 20;
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.min(
    (500 - 2 * padding) / width,
    (500 - 2 * padding) / height
  );

  // Center after scaling
  const offsetX = (minX + maxX) / 2;
  const offsetY = (minY + maxY) / 2;

  // Sort faces by their average z height based on their order in projectedFaces (lowest index = lowest z)
  // Since projectedFaces is already ordered, we can assign a z-index based on the array index.
  projectedFaces.forEach((face, idx) => {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = face
      .map(([x, y]) => {
        // Scale and center
        const sx = (x - offsetX) * scale;
        const sy = (y - offsetY) * scale;
        return `${sx},${sy}`;
      })
      .join(" ");
    polygon.setAttribute("points", points);
    // if the points in the face are in clockwise order, fill with grey, else fill with white
    polygon.setAttribute("fill", isClockwise(face) ? "grey" : "white");
    polygon.setAttribute("stroke", "black");
    // Set z-index using SVG's stacking order (appendChild order)
    // Lower index faces are appended first, so they appear below higher index faces
    g.appendChild(polygon);
  });

  svg.appendChild(g);

  // Create a blob from the SVG and download it
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "projected_faces.svg";
  a.click();
}

const faceMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.2,
  side: THREE.FrontSide//THREE.DoubleSide,
});
const faceMaterialBack = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  transparent: true,
  opacity: 0.2,
  side: THREE.BackSide, 
});
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x000000,
  linewidth: 2,
});

export const Viewer3D: React.FC<Viewer3DProps> = ({ cp, setCP, cpRef }) => {
  const mountRef: RefObject<HTMLDivElement | null> = useRef(null);
  const sceneRef = useRef<THREE.Scene | null>(null); // Ref for the scene
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Ref for the camera
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // Ref for the renderer


  const [rootFaceIndex, setRootFaceIndex] = useState<number>(0);
  const rootFaceIndexRef = useRef<number>(0);
  // Update rootFaceIndexRef whenever rootFaceIndex changes
  useEffect(() => {
    rootFaceIndexRef.current = rootFaceIndex;
  }, [rootFaceIndex]);


  // Set up the 3D scene
  useEffect(() => {
    if (!mountRef.current) return;


    // Scene
    const theme = document.documentElement.getAttribute("data-theme");
    // const color =
    //   edge_colors[theme || "dark"][edges_assignment[index]] ?? "green";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Set background color to white
    sceneRef.current = scene; // Store the scene in the ref

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(1, 1, 1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera; // Store the camera in the ref

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer; // Store the renderer in the ref

    const controls = new OrbitControls(camera, renderer.domElement);

    // Starter square
    const geometry = new THREE.PlaneGeometry(1, 1); // Unit square
    const plane = new THREE.Mesh(geometry, faceMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie on the X-Y plane
    scene.add(plane);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    if (sceneRef.current) {
      const backgroundColor = theme === "dark" ? 0x333333 : 0xffffff;
      sceneRef.current.background = new THREE.Color(backgroundColor);
    }
    // if (cpRef.current === null) return;
    // const foldedFaces = getFoldedFaces(cpRef.current,rootFaceIndexRef.current);
    // Access and modify the scene
    render()
    // if (sceneRef.current) {
    //   console.log("Clearing the scene");
    //   while (sceneRef.current.children.length > 0) {
    //     sceneRef.current.remove(sceneRef.current.children[0]);
    //   }
    //   for(const face of foldedFaces) {
    //     const polygon = polygon3D(face);
    //     sceneRef.current.add(polygon);
    //   }
    // }
  }, [cp,rootFaceIndex]);

  // Update the background color based on the theme
  useEffect(() => {
    if (!sceneRef.current) return;
  
    // Function to update the background color based on the theme
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const backgroundColor = theme === "dark" ? 0x333333 : 0xffffff;
      sceneRef.current!.background = new THREE.Color(backgroundColor);
    };
  
    // Initial theme setup
    updateTheme();
  
    // Create a MutationObserver to watch for changes to the `data-theme` attribute
    const observer = new MutationObserver(() => {
      updateTheme();
    });
  
    // Observe changes to the `data-theme` attribute on the <html> element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  
    // Cleanup the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);


  const render = () =>{
    if (cpRef.current=== null) return;
    const foldedFaces = getFoldedFaces(cpRef.current,rootFaceIndexRef.current);

    // Access and modify the scene
    if (sceneRef.current) {
      console.log("Clearing the scene");
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }

      // draw axes
      const axesHelper = new THREE.AxesHelper(0.1);
      sceneRef.current?.add(axesHelper);

      for(const face of foldedFaces) {
        const polygon = polygon3D(face);
        sceneRef.current.add(polygon);
      }
    }

  }
  // Register keybinds
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
      }
      if (event.key === "b") {
        render()
      }
      if (event.key === "-") {
        setRootFaceIndex(Math.max(rootFaceIndexRef.current - 1, 0));
        console.log("Root face index: ", rootFaceIndexRef.current);
      }
      if (event.key === "=") {
        setRootFaceIndex(rootFaceIndexRef.current + 1);
        console.log("Root face index: ", rootFaceIndexRef.current);
      }
      if (event.key === "n") {
        // Console log the current camera position
        if (cameraRef.current && cpRef.current) {
          console.log("Camera position: ", cameraRef.current.position);
          console.log("Camera rotation: ", cameraRef.current.rotation);

          const projectedFaces = projectTo2D(
            getFoldedFaces(cpRef.current, rootFaceIndexRef.current),
            [cameraRef.current.position.x,cameraRef.current.position.y,cameraRef.current.position.z]
          );
          console.log("Projected faces: ", projectedFaces);
          // now download as svg
          downloadSVG(projectedFaces);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};



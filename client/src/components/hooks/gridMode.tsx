import React, { useState, useMemo } from "react";
import { Mode } from "../../types/ui";
import { Point } from "../../types/cp";
import { ViewBox } from "./panZoom";
import GridSettings from "../modules/GridSettings";

interface UseGridModeReturn {
  modalOpen: boolean;
  toggleModal: () => void;
  gridUi: React.ReactElement | null;
  gridLines: React.ReactElement | null;
  showGrid: boolean;
  gridSize: number;
  extendGrid: boolean;
  gridHoverPoints: Point[];
}

const MAX_HOVER_POINTS = 5000;
const EXTEND_PADDING_PX = 100;

interface CanvasSize {
  width: number;
  height: number;
}

export const useGridMode = (
  mode: Mode,
  viewBox: ViewBox,
  canvasSize: CanvasSize,
): UseGridModeReturn => {
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(8);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [extendGrid, setExtendGrid] = useState<boolean>(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const getViewBoxBounds = () => {
    const width = 1 / viewBox.zoom;
    const height = 1 / viewBox.zoom;

    const worldPerPxX =
      canvasSize.width > 0 ? width / canvasSize.width : 0;
    const worldPerPxY =
      canvasSize.height > 0 ? height / canvasSize.height : 0;
    const padX = EXTEND_PADDING_PX * worldPerPxX;
    const padY = EXTEND_PADDING_PX * worldPerPxY;

    return {
      minX: viewBox.x - padX,
      maxX: viewBox.x + width + padX,
      minY: viewBox.y - padY,
      maxY: viewBox.y + height + padY,
    };
  };

  // Generate grid lines
  const generateGridLines = (): React.ReactElement[] => {
    const lines: React.ReactElement[] = [];
    const n = gridSize;

    if (n < 1) return lines;

    if (!extendGrid) {
      // Generate vertical lines (n-1 lines)
      for (let i = 1; i < n; i++) {
        const x = i / n;
        lines.push(
          <line
            key={`v-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={1}
            className="grid-line"
          />,
        );
      }

      // Generate horizontal lines (n-1 lines)
      for (let i = 1; i < n; i++) {
        const y = i / n;
        lines.push(
          <line
            key={`h-${i}`}
            x1={0}
            y1={y}
            x2={1}
            y2={y}
            className="grid-line"
          />,
        );
      }

      return lines;
    }

    const { minX, maxX, minY, maxY } = getViewBoxBounds();
    const startX = Math.floor(minX * n);
    const endX = Math.ceil(maxX * n);
    const startY = Math.floor(minY * n);
    const endY = Math.ceil(maxY * n);

    for (let k = startX; k <= endX; k++) {
      const x = k / n;
      lines.push(
        <line
          key={`vx-${k}`}
          x1={x}
          y1={minY}
          x2={x}
          y2={maxY}
          className="grid-line"
        />,
      );
    }

    for (let k = startY; k <= endY; k++) {
      const y = k / n;
      lines.push(
        <line
          key={`hy-${k}`}
          x1={minX}
          y1={y}
          x2={maxX}
          y2={y}
          className="grid-line"
        />,
      );
    }

    return lines;
  };

  const gridHoverPoints: Point[] = useMemo(() => {
    if (!showGrid) return [];
    if (mode !== Mode.Drawing) return [];

    const n = gridSize;
    if (n < 1) return [];

    if (!extendGrid) {
      const points: Point[] = [];
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++) {
          points.push({ x: i / n, y: j / n });
        }
      }
      return points;
    }

    const { minX, maxX, minY, maxY } = getViewBoxBounds();
    const startX = Math.floor(minX * n);
    const endX = Math.ceil(maxX * n);
    const startY = Math.floor(minY * n);
    const endY = Math.ceil(maxY * n);

    const countX = endX - startX + 1;
    const countY = endY - startY + 1;
    if (countX * countY > MAX_HOVER_POINTS) {
      return [];
    }

    const points: Point[] = [];
    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        points.push({ x: i / n, y: j / n });
      }
    }
    return points;
  }, [
    canvasSize.height,
    canvasSize.width,
    extendGrid,
    gridSize,
    mode,
    showGrid,
    viewBox.x,
    viewBox.y,
    viewBox.zoom,
  ]);

  const gridUi = modalOpen ? (
    <GridSettings
      showGrid={showGrid}
      setShowGrid={setShowGrid}
      gridSize={gridSize}
      setGridSize={setGridSize}
      extendGrid={extendGrid}
      setExtendGrid={setExtendGrid}
      onClose={closeModal}
    />
  ) : null;

  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    return <>{generateGridLines()}</>;
  }, [
    canvasSize.height,
    canvasSize.width,
    extendGrid,
    gridSize,
    showGrid,
    viewBox.x,
    viewBox.y,
    viewBox.zoom,
  ]);

  return {
    modalOpen,
    toggleModal,
    gridUi,
    gridLines,
    showGrid,
    gridSize,
    extendGrid,
    gridHoverPoints,
  };
};

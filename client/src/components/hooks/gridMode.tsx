import React, { useState, useMemo } from "react";
import { Mode } from "../../types/ui";
import GridSettings from "../modules/GridSettings";

interface UseGridModeReturn {
  modalOpen: boolean;
  toggleModal: () => void;
  gridUi: React.ReactElement | null;
  gridLines: React.ReactElement | null;
}

export const useGridMode = (mode: Mode): UseGridModeReturn => {
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(8);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Generate grid lines
  const generateGridLines = (): React.ReactElement[] => {
    const lines: React.ReactElement[] = [];
    const n = gridSize;

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
        />
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
        />
      );
    }

    return lines;
  };

  const gridUi = modalOpen ? (
    <GridSettings
      showGrid={showGrid}
      setShowGrid={setShowGrid}
      gridSize={gridSize}
      setGridSize={setGridSize}
      onClose={closeModal}
    />
  ) : null;

  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    return <>{generateGridLines()}</>;
  }, [showGrid, gridSize]);

  return {
    modalOpen,
    toggleModal,
    gridUi,
    gridLines,
  };
};

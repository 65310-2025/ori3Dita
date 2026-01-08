import React from "react";
import { useClickOutside } from "../hooks/clickOutside";
import "./GridSettings.css";

interface GridSettingsProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  onClose: () => void;
}

const GridSettings: React.FC<GridSettingsProps> = ({
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  onClose,
}) => {
  const ref = useClickOutside<HTMLDivElement>(onClose);

  const handleGridSizeChange = (value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      // Clamp to minimum of 1 and round to integer
      const clamped = Math.max(1, Math.round(parsed));
      setGridSize(clamped);
    }
  };

  return (
    <div className="Grid-settings" ref={ref}>
      <div className="Grid-settings-title">
        <h3>Grid Settings</h3>
      </div>
      <div className="Grid-settings-form">
        <label className="Grid-settings-form-label">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Display Grid
        </label>
        <label className="Grid-settings-form-label" htmlFor="gridSize">
          Grid Size:
        </label>
        <input
          className="Grid-settings-form-text"
          type="number"
          id="gridSize"
          name="gridSize"
          min="1"
          step="1"
          value={gridSize}
          onChange={(e) => handleGridSizeChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default GridSettings;

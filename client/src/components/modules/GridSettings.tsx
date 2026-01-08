import React from "react";
import { useClickOutside } from "../hooks/clickOutside";
import "./GridSettings.css";

interface GridSettingsProps {
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: number;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
  extendGrid: boolean;
  setExtendGrid: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

const GridSettings: React.FC<GridSettingsProps> = ({
  showGrid,
  setShowGrid,
  gridSize,
  setGridSize,
  extendGrid,
  setExtendGrid,
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

  const clampGridSize = (size: number) => {
    return Math.max(1, Math.round(size));
  };

  const halveGridSize = () => {
    setGridSize((prev) => clampGridSize(prev / 2));
  };

  const doubleGridSize = () => {
    setGridSize((prev) => clampGridSize(prev * 2));
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
        <label className="Grid-settings-form-label">
          <input
            type="checkbox"
            checked={extendGrid}
            onChange={(e) => setExtendGrid(e.target.checked)}
          />
          Extend grid
        </label>
        <label className="Grid-settings-form-label" htmlFor="gridSize">
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
        <div className="Grid-settings-form-actions">
          <button
            type="button"
            className="Grid-settings-form-action"
            onClick={halveGridSize}
          >
            ×½
          </button>
          <button
            type="button"
            className="Grid-settings-form-action"
            onClick={doubleGridSize}
          >
            ×2
          </button>
        </div>
      </div>
    </div>
  );
};

export default GridSettings;

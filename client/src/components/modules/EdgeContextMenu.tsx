import React, { useEffect, useState } from "react";

import { CP, Edge } from "../../types/cp";
import { useClickOutside } from "../hooks/clickOutside";
import "./EdgeContextMenu.css";

interface EdgeContextMenuProps {
  edgeID: string;
  cp: CP | null;
  setCP: (cp: CP) => void;
  setSelection: (selection: string[]) => void;
}

const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  edgeID,
  cp,
  setCP,
  setSelection,
}) => {
  const [angle, setAngle] = useState<string>("");
  const ref = useClickOutside<HTMLDivElement>(() => setSelection([]));

  useEffect(() => {
    if (cp !== null) {
      const edge = cp.edges.find((e: Edge) => e.id == edgeID);
      if (edge) {
        setAngle(((edge.foldAngle / Math.PI) * 180).toFixed(1));
      }
    }
  }, [cp, edgeID]);

  const validateAngle = (angle: number) => {
    if (isNaN(angle)) {
      return false;
    }
    return Math.abs(angle) <= Math.PI;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (cp === null) {
      return; // This should not happen
    }
    const newAngle = (Number(angle) / 180) * Math.PI;
    if (!validateAngle(newAngle)) {
      return;
    }
    const newCP = {
      ...cp,
      edges: cp.edges.map((e: Edge) =>
        e.id === edgeID ? { ...e, foldAngle: newAngle } : e,
      ),
    };
    setCP(newCP);
  };

  return (
    <div className="Edge-menu" ref={ref}>
      <div className="Edge-menu-title">
        <h3>Edit Crease</h3>
      </div>
      <form className="Edge-menu-form" onSubmit={submit}>
        <label className="Edge-menu-form-label" htmlFor="foldAngle">
          Fold Angle:
        </label>
        <input
          className="Edge-menu-form-text"
          type="text"
          id="foldAngle"
          name="foldAngle"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
        />
        <input className="Edge-menu-submit" type="submit" value="Save" />
        <input
          className="Edge-menu-close"
          type="button"
          value="Close"
          onClick={() => setSelection([])}
        />
      </form>
    </div>
  );
};

export default EdgeContextMenu;

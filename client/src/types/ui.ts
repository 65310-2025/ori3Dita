import deleteIcon from "../assets/icons/eraser.svg";
import drawIcon from "../assets/icons/pencil.svg";
import changeMvIcon from "../assets/icons/switch_mv.svg";
import selectIcon from "../assets/icons/wrench.svg";

export enum MvMode {
  Mountain = "M",
  Valley = "V",
  Border = "B",
  Aux = "A",
}

export enum Mode {
  Selecting = "selecting", // select, open inspector window
  Drawing = "drawing", // simple line draw
  Deleting = "deleting", // box delete
  ChangeMV = "changmv", // box change mv
}

export const modeKeys = [" ", "q", "w", "e"] as const;
export const mvKeys = ["a", "s", "d", "f"] as const;

export const modeMap: Record<string, Mode> = {
  " ": Mode.Drawing,
  q: Mode.Selecting,
  w: Mode.Deleting,
  e: Mode.ChangeMV,
};

export const modeIcons: Record<Mode, string> = {
  [Mode.Drawing]: drawIcon,
  [Mode.Selecting]: selectIcon,
  [Mode.Deleting]: deleteIcon,
  [Mode.ChangeMV]: changeMvIcon,
};

export const mvMap: Record<string, MvMode> = {
  a: MvMode.Mountain,
  s: MvMode.Valley,
  d: MvMode.Border,
  f: MvMode.Aux,
};

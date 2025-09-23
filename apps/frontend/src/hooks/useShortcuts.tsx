import { useContext } from "react";
import { ShortcutsContext } from "../context/ShortcutsContext";

export const useShortcuts = () => {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useShortcuts must be used within ShortcutsProvider");
  return ctx;
};

import React, { createContext, useEffect, useRef } from "react";
import { useShortcuts } from "../hooks/useShortcuts";

export type Shortcut = {
  combo: string;
  action: (event: KeyboardEvent) => void;
};
interface ShortcutsContextType {
  registerShortcut: (combo: string, action: (event: KeyboardEvent) => void) => void;
  unregisterShortcut: (combo: string) => void;
}

export const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

export function useShortcut(combo: string, action: (event: KeyboardEvent) => void) {
  const { registerShortcut, unregisterShortcut } = useShortcuts();
  React.useEffect(() => {
    registerShortcut(combo, action);
    return () => unregisterShortcut(combo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo, action]);
}

export const ShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shortcutsRef = useRef<Map<string, (event: KeyboardEvent) => void>>(new Map());

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const combo = [
        event.ctrlKey ? "Ctrl" : null,
        event.altKey ? "Alt" : null,
        event.shiftKey ? "Shift" : null,
        event.metaKey ? "Meta" : null,
        event.key.length === 1 ? event.key.toUpperCase() : event.key
      ]
        .filter(Boolean)
        .join("+");
      const action = shortcutsRef.current.get(combo);
      if (action) {
        event.preventDefault();
        action(event);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const registerShortcut = (combo: string, action: (event: KeyboardEvent) => void) => {
    shortcutsRef.current.set(combo, action);
  };

  const unregisterShortcut = (combo: string) => {
    shortcutsRef.current.delete(combo);
  };

  return (
    <ShortcutsContext.Provider value={{ registerShortcut, unregisterShortcut }}>
      {children}
    </ShortcutsContext.Provider>
  );
}; 
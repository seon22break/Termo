import { useContext } from "react";
import { FolderContext } from "../context/FolderContext";

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within FolderProvider");
  }
  return context;
};

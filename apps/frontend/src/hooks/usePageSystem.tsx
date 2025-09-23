import { useContext } from "react";
import { PageSystemContext } from "../context/PageSystemContext";

export const usePageSystem = () => {
  const context = useContext(PageSystemContext);
  if (!context) {
    throw new Error("usePageSystem must be used within PageSystemProvider");
  }
  return context;
};

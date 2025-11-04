import { useCallback } from "react";

export const useElementPosition = (element: HTMLDivElement | null) => {
  const clearElementPosition = useCallback(() => {
    if (!element) return;
    element.scrollTop = 0;
    element.scrollLeft = 0;
  }, [element]);

  return {
    clearElementPosition,
  };
};

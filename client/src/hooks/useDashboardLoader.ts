import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { importDashboard, loadDashboard } from "@/store";

export function useDashboardLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedDashboard = loadDashboard();
    if (savedDashboard) {
      dispatch(importDashboard(savedDashboard));
    }
  }, [dispatch]);
}

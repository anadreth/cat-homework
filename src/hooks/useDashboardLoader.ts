/**
 * useDashboardLoader Hook
 *
 * Handles loading saved dashboard from LocalStorage on mount
 * Separates persistence logic from UI components
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { importDashboard, loadDashboard } from '@/store';

/**
 * Load dashboard from LocalStorage on component mount
 * Automatically imports saved dashboard if available
 */
export function useDashboardLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedDashboard = loadDashboard();
    if (savedDashboard) {
      dispatch(importDashboard(savedDashboard));
    }
  }, [dispatch]);
}

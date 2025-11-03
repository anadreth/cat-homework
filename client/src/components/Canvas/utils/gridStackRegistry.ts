/**
 * GridStack Instance Registry
 *
 * Provides a simple registry for GridStack instances so Redux middleware
 * can access the current GridStack instance without prop drilling.
 *
 * This eliminates the need for useEffect syncing between Redux and GridStack.
 */

import type { GridStack } from "gridstack";

class GridStackRegistry {
  private instance: GridStack | null = null;

  /**
   * Register a GridStack instance
   * Called when GridStack is initialized in the component
   */
  register(gridStack: GridStack): void {
    this.instance = gridStack;
  }

  /**
   * Unregister the current GridStack instance
   * Called on component unmount
   */
  unregister(): void {
    this.instance = null;
  }

  /**
   * Get the current GridStack instance
   * Returns null if no instance is registered
   */
  getInstance(): GridStack | null {
    return this.instance;
  }

  /**
   * Check if an instance is registered
   */
  hasInstance(): boolean {
    return this.instance !== null;
  }
}

// Singleton instance
export const gridStackRegistry = new GridStackRegistry();

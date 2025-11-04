import type { GridStack } from "gridstack";

class GridStackRegistry {
  private instance: GridStack | null = null;
  register(gridStack: GridStack): void {
    this.instance = gridStack;
  }
  unregister(): void {
    this.instance = null;
  }
  getInstance(): GridStack | null {
    return this.instance;
  }
  hasInstance(): boolean {
    return this.instance !== null;
  }
}

export const gridStackRegistry = new GridStackRegistry();

/**
 * Store Manager - Global registry for Zustand stores
 * Mimics MST's getStoreById, getStores, addStore, removeStore
 */

import type {StoreApi} from 'zustand';

type StoreType = StoreApi<any>;

// Store factory type - creates a store with optional config
type StoreFactory = (config?: {
  id: string;
  path?: string;
  parentId?: string;
}) => StoreType;

class StoreManager {
  private stores: Map<string, StoreType> = new Map();
  private factories: Map<string, StoreFactory> = new Map();

  addStore(id: string, store: StoreType): void {
    this.stores.set(id, store);
  }

  getStore(id: string): StoreType | undefined {
    return this.stores.get(id);
  }

  getStores(): Map<string, StoreType> {
    return this.stores;
  }

  removeStore(id: string): void {
    this.stores.delete(id);
  }

  hasStore(id: string): boolean {
    return this.stores.has(id);
  }

  clear(): void {
    this.stores.clear();
  }

  getAll(): StoreType[] {
    return Array.from(this.stores.values());
  }

  getByType(storeType: string): StoreType[] {
    return this.getAll().filter(
      store => store.getState().storeType === storeType
    );
  }

  // Register a store factory by type
  registerFactory(storeType: string, factory: StoreFactory): void {
    this.factories.set(storeType, factory);
  }

  // Create a store using registered factory
  createStore(storeType: string, config: {
    id: string;
    path?: string;
    parentId?: string;
  }): StoreType | null {
    const factory = this.factories.get(storeType);
    if (!factory) {
      console.warn(`No factory registered for store type: ${storeType}`);
      return null;
    }
    const store = factory(config);
    this.addStore(config.id, store);
    return store;
  }

  hasFactory(storeType: string): boolean {
    return this.factories.has(storeType);
  }
}

// Singleton instance
export const storeManager = new StoreManager();

// Convenience functions matching MST manager API
export function getStoreById(id: string) {
  return storeManager.getStore(id)?.getState();
}

export function getStores() {
  return storeManager.getAll().map(store => store.getState());
}

export function addStore(id: string, store: StoreType) {
  storeManager.addStore(id, store);
  return store.getState();
}

export function removeStore(id: string) {
  storeManager.removeStore(id);
}

// Export for registering factories
export {StoreFactory};

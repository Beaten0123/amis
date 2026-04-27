/**
 * Base Zustand Store Factory
 * Provides common store functionality similar to MST's StoreNode
 */

import {create} from 'zustand';
import type {StoreApi} from 'zustand';
import type {StoreNodeState} from './types';
import {storeManager} from './manager';

export interface CreateStoreOptions {
  id: string;
  path?: string;
  storeType: string;
  parentId?: string;
}

export interface BaseStoreState extends StoreNodeState {
  // Parent/child management
  parentStore: any;
  children: any[];
}

/**
 * Create a base store with common functionality
 * Mimics MST's StoreNode behavior
 */
export function createBaseStore(options: CreateStoreOptions) {
  const {id, path = '', storeType, parentId = ''} = options;

  type CombinedState = BaseStoreState;

  return create<CombinedState>()((set, get) => ({
    // StoreNode properties
    id,
    path,
    storeType,
    disposed: false,
    parentId,
    childrenIds: [],

    // Parent/child accessors
    parentStore: null,
    children: [],

    // Common actions
    dispose: () => {
      const state = get();
      if (state.disposed) {
        return;
      }

      set({disposed: true});

      // Remove from parent's children
      if (state.parentId) {
        const parent = storeManager.getStore(state.parentId);
        if (parent) {
          const parentState = parent.getState() as any;
          parentState.removeChild?.(id);
        }
      }

      // Remove from manager
      storeManager.removeStore(id);
    },

    addChild: (childId: string) => {
      set(state => ({
        childrenIds: [...state.childrenIds, childId]
      }));
    },

    removeChild: (childId: string) => {
      set(state => ({
        childrenIds: state.childrenIds.filter(cid => cid !== childId)
      }));
    }
  }));
}

/**
 * Initialize store in the global store manager
 */
export function registerStoreInManager<T extends {id: string; parentId?: string}>(
  store: StoreApi<T>,
  options: CreateStoreOptions
) {
  const {id, parentId} = options;

  // Add to global manager
  storeManager.addStore(id, store);

  // Register with parent if exists
  if (parentId) {
    const parent = storeManager.getStore(parentId);
    if (parent) {
      // Call parent's addChild action if it exists
      const parentState = parent.getState() as any;
      parentState.addChild?.(id);
    }
  }

  return store;
}

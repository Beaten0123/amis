/**
 * PaginationStore - Zustand Implementation
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createBaseStore, registerStoreInManager} from './baseStore';
import {resolveVariable} from '../../utils/tpl-builtin';
import {createObject} from '../../utils/helper';
import type {PaginationStoreState} from './types';

export interface PaginationStoreActions {
  switchTo(page: number, perPage?: number): void;
  setPage(page: number): void;
  setPerPage(perPage: number): void;
}

export type PaginationStore = ReturnType<typeof createPaginationStore>;

export function createPaginationStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  page?: number;
  perPage?: number;
  inputName?: string;
  outputName?: string;
  mode?: string;
  ellipsisPageGap?: number;
}) {
  const {
    id,
    path = '',
    parentId = '',
    page = 1,
    perPage = 10,
    inputName = '',
    outputName = '',
    mode = 'normal',
    ellipsisPageGap = 5
  } = options;

  // Create base store state
  const baseStore = createBaseStore({
    id,
    path,
    storeType: 'PaginationStore',
    parentId
  });

  // Merge base with pagination-specific initial state
  type CombinedState = PaginationStoreState &
    PaginationStoreActions & {get inputItems(): any[]; get locals(): any; get lastPage(): number};

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // Pagination-specific state
    page,
    perPage,
    inputName,
    outputName,
    mode,
    ellipsisPageGap,

    // Computed: inputItems
    get inputItems() {
      const state = get();
      const items = resolveVariable(state.data || {}, state.inputName || 'items');
      return Array.isArray(items) ? items : [];
    },

    // Computed: lastPage
    get lastPage() {
      const state = get();
      const items = state.inputItems;
      return Math.ceil(items.length / state.perPage) || 1;
    },

    // Computed: locals
    get locals() {
      const state = get();
      const skip = (state.page - 1) * state.perPage;
      const items = state.inputItems;

      return createObject(state.data || {}, {
        currentPage: state.page,
        lastPage: state.lastPage,
        [state.outputName || 'items']: items.slice(skip, skip + state.perPage)
      });
    },

    // Actions
    switchTo: (page: number, perPage?: number) => {
      set(s => ({
        page,
        ...(typeof perPage === 'number' ? {perPage} : {})
      }));
    },

    setPage: (page: number) => {
      set({page});
    },

    setPerPage: (perPage: number) => {
      set({perPage});
    }
  }));
}

/**
 * Create and register a PaginationStore
 */
export function createAndRegisterPaginationStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  page?: number;
  perPage?: number;
  inputName?: string;
  outputName?: string;
  mode?: string;
  ellipsisPageGap?: number;
}) {
  const store = createPaginationStore(options);
  const state = store.getState();

  // Register in manager
  registerStoreInManager(store, {
    id: options.id,
    path: options.path || '',
    storeType: 'PaginationStore',
    parentId: options.parentId
  });

  return store;
}

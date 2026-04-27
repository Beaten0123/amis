/**
 * CRUDStore - Zustand Implementation
 * Store for CRUD list operations
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';
import type {Api, fetchOptions} from '../../types';
import {isObjectShallowModified} from '../../utils';
import {qsstringify} from '../../utils/helper';

export interface CRUDStoreState {
  // Query state
  pristineQuery: Record<string, any>;
  query: Record<string, any>;
  prevPage: number;
  page: number;
  perPage: number;
  total: number;
  mode: string;
  hasNext: boolean;

  // Selection
  selectedAction: any;
  columns: any[];
  items: any[];
  selectedItems: any[];
  unSelectedItems: any[];

  // UI state
  filterTogglable: boolean;
  filterVisible: boolean;
  hasInnerModalOpen: boolean;
}

export interface CRUDStoreActions {
  // Pagination
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Query
  updateQuery: (
    values: object,
    updater?: Function,
    pageField?: string,
    perPageField?: string,
    replace?: boolean
  ) => void;
  setQuery: (query: Record<string, any>) => void;
  resetQuery: () => void;

  // Items
  setItems: (items: any[]) => void;
  setSelectedItems: (items: any[]) => void;
  setUnSelectedItems: (items: any[]) => void;
  clearItems: () => void;

  // Selection
  toggleItemSelected: (item: any) => void;
  toggleAllSelected: () => void;
  clearSelection: () => void;

  // Filters
  setFilterTogglable: (togglable: boolean) => void;
  setFilterVisible: (visible: boolean) => void;

  // Modal
  setInnerModalOpen: (open: boolean) => void;
}

export type CRUDStore = ReturnType<typeof createCRUDStore>;

export function createCRUDStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  page?: number;
  perPage?: number;
}) {
  const {
    id,
    path = '',
    parentId = '',
    page = 1,
    perPage = 10
  } = options;

  type CombinedState = CRUDStoreState & CRUDStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // CRUDStore specific state
    pristineQuery: {},
    query: {},
    prevPage: 1,
    page,
    perPage,
    total: 0,
    mode: 'normal',
    hasNext: false,
    selectedAction: undefined,
    columns: [],
    items: [],
    selectedItems: [],
    unSelectedItems: [],
    filterTogglable: false,
    filterVisible: true,
    hasInnerModalOpen: false,

    // Computed: lastPage
    get lastPage() {
      const s = get();
      return Math.max(Math.ceil(s.total / (s.perPage < 1 ? 10 : s.perPage)), 1);
    },

    // Computed: filterData
    get filterData() {
      const s = get();
      return {...s.data, ...s.query};
    },

    // Computed: selectedItemsAsArray
    get selectedItemsAsArray() {
      return get().selectedItems;
    },

    // Computed: itemsAsArray
    get itemsAsArray() {
      return get().items;
    },

    // Actions
    setPage: (page) => {
      const state = get();
      set({prevPage: state.page, page});
    },

    setPerPage: (perPage) => set({perPage}),

    updateQuery: (
      values: object,
      updater?: Function,
      pageField: string = 'page',
      perPageField: string = 'perPage',
      replace: boolean = false
    ) => {
      const state = get();
      const originQuery = state.query;
      const query: any = replace
        ? {...values}
        : {...originQuery, ...values};

      const exceptedLooselyRules: [any, any][] = [
        [0, ''],
        [false, ''],
        [false, '0'],
        [false, 0],
        [true, 1],
        [true, '1']
      ];

      if (
        isObjectShallowModified(originQuery, query, (lhs: any, rhs: any) => {
          if (
            exceptedLooselyRules.some(
              rule => rule.includes(lhs) && rule.includes(rhs)
            )
          ) {
            return lhs !== rhs;
          }
          return lhs != rhs;
        })
      ) {
        if (query[pageField || 'page']) {
          set({page: parseInt(query[pageField || 'page'], 10)});
        }

        if (query[perPageField || 'perPage']) {
          set({perPage: parseInt(query[perPageField || 'perPage'], 10)});
        }

        set({query});
        updater && setTimeout(() => updater(`?${qsstringify(query)}`), 4);
      }
    },

    setQuery: (query) => set({query}),

    resetQuery: () => {
      const state = get();
      set({query: {...state.pristineQuery}});
    },

    setItems: (items) => set({items}),

    setSelectedItems: (selectedItems) => set({selectedItems}),

    setUnSelectedItems: (unSelectedItems) => set({unSelectedItems}),

    clearItems: () => set({items: [], selectedItems: [], unSelectedItems: []}),

    toggleItemSelected: (item) => {
      const state = get();
      const index = state.selectedItems.findIndex(
        (i: any) => (i.__pristine || i) === (item.__pristine || item)
      );

      if (index >= 0) {
        set({
          selectedItems: state.selectedItems.filter(
            (_: any, i: number) => i !== index
          )
        });
      } else {
        set({
          selectedItems: [...state.selectedItems, item]
        });
      }
    },

    toggleAllSelected: () => {
      const state = get();
      if (state.selectedItems.length === state.items.length) {
        set({selectedItems: []});
      } else {
        set({selectedItems: [...state.items]});
      }
    },

    clearSelection: () => set({selectedItems: [], unSelectedItems: []}),

    setFilterTogglable: (filterTogglable) => set({filterTogglable}),

    setFilterVisible: (filterVisible) => set({filterVisible}),

    setInnerModalOpen: (hasInnerModalOpen) => set({hasInnerModalOpen}),

    // fetchCtxOf helper
    fetchCtxOf: (data: any, options: {pageField?: string; perPageField?: string} = {}) => {
      const state = get();
      return {
        ...state.data,
        ...state.query,
        [options.pageField || 'page']: state.page,
        [options.perPageField || 'perPage']: state.perPage,
        ...data
      };
    }
  }));
}

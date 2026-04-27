/**
 * TableStore - Zustand Implementation
 * Store for table state management
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';
import isEqual from 'lodash-es/isEqual';

export interface TableColumn {
  id: string;
  label: string;
  name?: string;
  type: string;
  toggled: boolean;
  sortable: boolean;
  searchable?: any;
  width?: number;
  fixed?: string;
  [key: string]: any;
}

export interface TableStoreState {
  // Columns
  columns: TableColumn[];
  currentColumn: TableColumn | null;

  // Data
  items: any[];
  selectedItems: any[];

  // Selection
  selection: string[];
  selectedAll: boolean;

  // Pagination
  page: number;
  perPage: number;
  total: number;

  // UI state
  loading: boolean;
  expandeds: string[];

  // Draggable
  draggable: boolean;
  dragState: {
    draggingId: string | null;
    targetId: string | null;
    mode: 'before' | 'after' | 'inner' | null;
  };
}

export interface TableStoreActions {
  // Columns
  setColumns: (columns: TableColumn[]) => void;
  toggleColumn: (columnId: string) => void;

  // Data
  setItems: (items: any[]) => void;
  updateItem: (id: string, updates: any) => void;
  addItem: (item: any, index?: number) => void;
  removeItem: (id: string) => void;

  // Selection
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelected: () => any[];

  // Pagination
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setTotal: (total: number) => void;

  // Expand
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Drag and drop
  setDragState: (dragState: TableStoreState['dragState']) => void;
}

export type TableStore = ReturnType<typeof createTableStore>;

export function createTableStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  columns?: TableColumn[];
}) {
  const {
    id,
    path = '',
    parentId = '',
    columns = []
  } = options;

  type CombinedState = TableStoreState & TableStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // TableStore specific state
    columns,
    currentColumn: null,
    items: [],
    selectedItems: [],
    selection: [],
    selectedAll: false,
    page: 1,
    perPage: 10,
    total: 0,
    loading: false,
    expandeds: [],
    draggable: false,
    dragState: {
      draggingId: null,
      targetId: null,
      mode: null
    },

    // Actions
    setColumns: (columns) => set({columns}),

    toggleColumn: (columnId) => {
      set(state => ({
        columns: state.columns.map(col =>
          col.id === columnId ? {...col, toggled: !col.toggled} : col
        )
      }));
    },

    setItems: (items) => set({items}),

    updateItem: (itemId, updates) => {
      set(state => ({
        items: state.items.map(item =>
          item.id === itemId ? {...item, ...updates} : item
        )
      }));
    },

    addItem: (item, index) => {
      set(state => {
        const newItems = [...state.items];
        if (index !== undefined) {
          newItems.splice(index, 0, item);
        } else {
          newItems.push(item);
        }
        return {items: newItems};
      });
    },

    removeItem: (itemId) => {
      set(state => ({
        items: state.items.filter(item => item.id !== itemId),
        selection: state.selection.filter(id => id !== itemId)
      }));
    },

    toggleSelection: (itemId) => {
      set(state => {
        const isSelected = state.selection.includes(itemId);
        const newSelection = isSelected
          ? state.selection.filter(id => id !== itemId)
          : [...state.selection, itemId];

        return {
          selection: newSelection,
          selectedAll: newSelection.length === state.items.length
        };
      });
    },

    selectAll: () => {
      set(state => ({
        selection: state.items.map(item => item.id),
        selectedAll: true
      }));
    },

    clearSelection: () => {
      set({selection: [], selectedAll: false});
    },

    getSelected: () => {
      const state = get();
      return state.items.filter(item => state.selection.includes(item.id));
    },

    setPage: (page) => set({page}),
    setPerPage: (perPage) => set({perPage}),
    setTotal: (total) => set({total}),

    toggleExpand: (itemId) => {
      set(state => ({
        expandeds: state.expandeds.includes(itemId)
          ? state.expandeds.filter(id => id !== itemId)
          : [...state.expandeds, itemId]
      }));
    },

    expandAll: () => {
      set(state => ({
        expandeds: state.items.map(item => item.id)
      }));
    },

    collapseAll: () => {
      set({expandeds: []});
    },

    setDragState: (dragState) => set({dragState}),

    // Computed
    get lastPage() {
      const s = get();
      return Math.ceil(s.total / s.perPage) || 1;
    },

    get isAllSelected() {
      const s = get();
      return s.items.length > 0 && s.selection.length === s.items.length;
    },

    get isNoneSelected() {
      return get().selection.length === 0;
    }
  }));
}

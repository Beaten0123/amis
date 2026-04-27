/**
 * ListStore - Zustand Implementation
 * Store for list components
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';

export interface ListStoreState {
  selected: any;
  items: any[];
}

export interface ListStoreActions {
  setItems: (items: any[]) => void;
  setSelected: (selected: any) => void;
  toggleSelected: (item: any) => void;
}

export type ListStore = ReturnType<typeof createListStore>;

export function createListStore(options: {
  id: string;
  path?: string;
  parentId?: string;
}) {
  const {id, path = '', parentId = ''} = options;

  type CombinedState = ListStoreState & ListStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // ListStore specific state
    selected: null,
    items: [],

    // Actions
    setItems: (items) => set({items}),

    setSelected: (selected) => set({selected}),

    toggleSelected: (item) => {
      const state = get();
      const isSelected = state.selected === item;
      set({selected: isSelected ? null : item});
    }
  }));
}

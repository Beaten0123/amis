/**
 * AppStore - Zustand Implementation
 * Store for app/workspace state
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';

export interface AppStoreState {
  pages: any[];
  activePage: string;
  activePagePath: string;
}

export interface AppStoreActions {
  setPages: (pages: any[]) => void;
  setActivePage: (page: string, path?: string) => void;
  addPage: (page: any) => void;
  removePage: (pageId: string) => void;
}

export type AppStore = ReturnType<typeof createAppStore>;

export function createAppStore(options: {
  id: string;
  path?: string;
  parentId?: string;
}) {
  const {id, path = '', parentId = ''} = options;

  type CombinedState = AppStoreState & AppStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // AppStore specific state
    pages: [],
    activePage: '',
    activePagePath: '',

    // Actions
    setPages: (pages) => set({pages}),

    setActivePage: (activePage, activePagePath = '') => {
      set({activePage, activePagePath});
    },

    addPage: (page) => {
      set(state => ({
        pages: [...state.pages, page]
      }));
    },

    removePage: (pageId) => {
      set(state => ({
        pages: state.pages.filter(p => p.id !== pageId)
      }));
    }
  }));
}

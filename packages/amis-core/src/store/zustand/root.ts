/**
 * RootStore - Zustand Implementation
 * Global store for application state
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createBaseStore} from './baseStore';
import {registerStoreInManager} from './baseStore';
import {storeManager} from './manager';
import type {RootStoreState} from './types';

export interface RootStoreActions {
  // Global variables
  setGlobalData: (data: Record<string, any>) => void;
  updateGlobalData: (data: Record<string, any>) => void;

  // Locale
  setLocale: (locale: string) => void;

  // Theme
  setTheme: (theme: string) => void;

  // Store management
  getStoreById: (id: string) => any;
  addStore: (store: any) => any;
  removeStore: (id: string) => void;
}

export type RootStore = ReturnType<typeof createRootStore>;

export function createRootStore(options: {
  id?: string;
  path?: string;
}) {
  const {id = 'root', path = ''} = options;

  type CombinedState = RootStoreState & RootStoreActions & {storeType: 'RootStore'};

  const baseStore = createBaseStore<CombinedState>({
    id,
    path,
    storeType: 'RootStore',
    parentId: ''
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // RootStore specific state
    globalVars: [],
    globalData: {},
    locale: 'zh-CN',
    theme: 'cxd',

    // Actions
    setGlobalData: (data) => {
      set({globalData: data});
    },

    updateGlobalData: (data) => {
      set(state => ({
        globalData: {...state.globalData, ...data}
      }));
    },

    setLocale: (locale) => {
      set({locale});
    },

    setTheme: (theme) => {
      set({theme});
    },

    getStoreById: (storeId) => {
      return storeManager.getStore(storeId)?.getState();
    },

    addStore: (storeConfig) => {
      const {id, path, storeType, parentId} = storeConfig;
      const factory = storeManager.getByType(storeType)[0];

      if (factory) {
        const store = factory();
        registerStoreInManager(store, {
          id,
          path,
          storeType,
          parentId
        });
        return store.getState();
      }

      return null;
    },

    removeStore: (storeId) => {
      storeManager.removeStore(storeId);
    }
  }));
}

/**
 * Create and register the RootStore singleton
 */
let rootStoreInstance: RootStore | null = null;

export function createAndRegisterRootStore() {
  if (rootStoreInstance) {
    return rootStoreInstance;
  }

  rootStoreInstance = createRootStore({id: 'root'});
  const state = rootStoreInstance.getState();

  registerStoreInManager(rootStoreInstance, {
    id: 'root',
    path: '',
    storeType: 'RootStore'
  });

  return rootStoreInstance;
}

export function getRootStore() {
  return rootStoreInstance?.getState();
}

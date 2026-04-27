/**
 * Store Factory Registration
 * Registers all Zustand store factories by type
 */

import {storeManager, StoreFactory} from './manager';
import {createPaginationStore} from './pagination';
import {createFormItemStore} from './formItem';
import {createIRendererStore} from './iRenderer';
import {createServiceStore} from './service';
import {createCRUDStore} from './crud';
import {createFormStore} from './form';
import {createListStore} from './list';
import {createModalStore} from './modal';
import {createAppStore} from './app';
import {createTableStore} from './table';
import {createComboStore} from './combo';

// Factory map for stores that need special config handling
const factoryMap: Record<string, StoreFactory> = {
  // iRendererStore
  iRendererStore: (config) =>
    createIRendererStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // PaginationStore
  PaginationStore: (config) =>
    createPaginationStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // FormItemStore
  FormItemStore: (config) =>
    createFormItemStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // ServiceStore
  ServiceStore: (config) =>
    createServiceStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // CRUDStore
  CRUDStore: (config) =>
    createCRUDStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // FormStore
  FormStore: (config) =>
    createFormStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // ListStore
  ListStore: (config) =>
    createListStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // ModalStore
  ModalStore: (config) =>
    createModalStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // AppStore
  AppStore: (config) =>
    createAppStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // TableStore
  TableStore: (config) =>
    createTableStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    }),

  // ComboStore
  ComboStore: (config) =>
    createComboStore({
      id: config?.id || 'unknown',
      path: config?.path,
      parentId: config?.parentId
    })
};

// Register all factories
export function registerStoreFactories() {
  Object.entries(factoryMap).forEach(([storeType, factory]) => {
    storeManager.registerFactory(storeType, factory);
  });
}

// Auto-register on import
registerStoreFactories();

// Export factory map for external use
export {factoryMap};

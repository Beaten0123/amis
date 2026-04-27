/**
 * Zustand Store Exports
 * Migration from MobX-State-Tree to Zustand
 */

// Types
export * from './types';

// Base store factory
export {createBaseStore, registerStoreInManager} from './baseStore';

// Store manager
export {
  storeManager,
  getStoreById,
  getStores,
  addStore,
  removeStore
} from './manager';

// Store implementations
export {createPaginationStore} from './pagination';
export {createFormItemStore} from './formItem';
export {createIRendererStore} from './iRenderer';
export {createRootStore} from './root';
export {createServiceStore} from './service';
export type {ServiceStore, ServiceStoreState, ServiceStoreActions} from './service';
export {createCRUDStore} from './crud';
export type {CRUDStore, CRUDStoreState, CRUDStoreActions} from './crud';
export {createFormStore} from './form';
export type {FormStore, FormStoreState, FormStoreActions} from './form';
export {createListStore} from './list';
export type {ListStore, ListStoreState, ListStoreActions} from './list';
export {createModalStore} from './modal';
export type {ModalStore, ModalStoreState, ModalStoreActions} from './modal';
export {createAppStore} from './app';
export type {AppStore, AppStoreState, AppStoreActions} from './app';

/**
 * Zustand Store Types for Amis
 * Migration from MobX-State-Tree to Zustand
 */

import type {Store as ZustandStore} from 'zustand';

export interface StoreNodeState {
  id: string;
  path: string;
  storeType: string;
  disposed: boolean;
  parentId: string;
  childrenIds: string[];
}

export interface iRendererStoreState {
  // From StoreNode
  id: string;
  path: string;
  storeType: string;
  disposed: boolean;
  parentId: string;
  childrenIds: string[];

  // iRendererStore specific
  hasRemoteData: boolean;
  data: Record<string, any>;
  initedAt: number;
  updatedAt: number;
  pristine: Record<string, any>;
  pristineRaw: Record<string, any>;
  upStreamData: Record<string, any>;
  action: any;
  dialogSchema: any;
  dialogOpen: boolean;
  dialogData: any;
  drawerSchema: any;
  drawerOpen: boolean;
  drawerData: any;
}

export interface PaginationStoreState extends iRendererStoreState {
  page: number;
  perPage: number;
  inputName: string;
  outputName: string;
  mode: string;
  ellipsisPageGap: number;
}

export interface FormItemStoreState extends iRendererStoreState {
  name: string;
  value: any;
  prinstine: any;
  rules: any;
  messages: any;
  valid: boolean;
  error: string;
  validating: boolean;
}

export interface RootStoreState {
  // Global state
  globalVars: any[];
  globalData: Record<string, any>;
  locale: string;
  theme: string;
}

export type AmisStore = ZustandStore<any>;

export interface StoreActions {
  dispose: () => void;
}

export interface RendererActions {
  initData: (data: object, skipSetPristine?: boolean) => void;
  updateData: (data: object, ...args: any[]) => void;
  changeValue: (name: string, value: any, ...args: any[]) => void;
  reset: () => void;
}

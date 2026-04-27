/**
 * iRendererStore - Zustand Implementation
 * Base store for all renderer stores
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createBaseStore} from './baseStore';
import type {iRendererStoreState} from './types';
import {
  getVariable,
  cloneObject,
  setVariable,
  deleteVariable,
  extendObject
} from '../../utils/helper';
import {dataMapping} from '../../utils/tpl-builtin';
import {
  extractObjectChain,
  createObjectFromChain,
  concatData
} from '../../utils';

export interface iRendererStoreActions {
  // Store management
  setTopStore: (store: any) => void;

  // Data management
  initData: (
    data?: object,
    skipSetPristine?: boolean,
    changeReason?: any
  ) => void;
  updateData: (
    data?: object,
    tag?: object,
    replace?: boolean,
    concatFields?: string | string[],
    changeReason?: any
  ) => void;
  changeValue: (
    name: string,
    value: any,
    changePristine?: boolean,
    force?: boolean,
    otherModifier?: (data: Object) => void,
    changeReason?: any
  ) => void;
  reset: () => void;

  // Global variables
  temporaryUpdateGlobalVars: (globalVar: any) => void;
  unDoTemporaryUpdateGlobalVars: () => void;

  // Dialog management
  openDialog: (
    ctx: any,
    additonal?: object,
    callback?: (confirmed: boolean, values: any) => void,
    scoped?: any
  ) => void;
  closeDialog: (confirmed?: any, data?: any) => void;
  getDialogScoped: () => any;

  // Drawer management
  openDrawer: (
    ctx: any,
    additonal?: object,
    callback?: (confirmed: boolean, ret: any) => void,
    scoped?: any
  ) => void;
  closeDrawer: (confirmed?: any, data?: any) => void;
  getDrawerScoped: () => any;

  // Current action
  setCurrentAction: (action: any, resolveDefinitions?: (schema: any) => any) => void;
}

export type IRendererStore = ReturnType<typeof createIRendererStore>;

export function createIRendererStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  hasRemoteData?: boolean;
  data?: Record<string, any>;
}) {
  const {
    id,
    path = '',
    parentId = '',
    hasRemoteData = false,
    data = {}
  } = options;

  type CombinedState = iRendererStoreState & iRendererStoreActions;

  const baseStore = createBaseStore({
    id,
    path,
    storeType: 'iRendererStore',
    parentId
  });

  // Dialog/Drawer callbacks storage (outside state)
  const dialogCallbacks = new Map<any, (confirmed?: any, value?: any) => void>();
  let dialogScoped: any = null;
  let drawerScoped: any = null;
  let topStoreRef: any = null;

  // Getter for topStore
  const getTopStore = () => topStoreRef;

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // iRendererStore specific state
    hasRemoteData,
    data,
    initedAt: 0,
    updatedAt: 0,
    pristine: {},
    pristineRaw: {},
    upStreamData: {},
    action: undefined,
    dialogSchema: undefined,
    dialogOpen: false,
    dialogData: undefined,
    drawerSchema: undefined,
    drawerOpen: false,
    drawerData: undefined,

    // Actions
    setTopStore: (store: any) => {
      topStoreRef = store;
    },

    initData: (data = {}, skipSetPristine = false, changeReason?: any) => {
      const now = Date.now();
      const state = get();

      let finalData = data;
      if (state.data.__tag) {
        const chain = extractObjectChain(data);
        chain.unshift(state.data.__tag);
        finalData = createObjectFromChain(chain);
      }

      set(s => ({
        initedAt: now,
        data: finalData,
        upStreamData: finalData,
        ...(skipSetPristine
          ? {}
          : {
              pristine: finalData,
              pristineRaw: finalData
            })
      }));
    },

    updateData: (
      data = {},
      tag?: object,
      replace?: boolean,
      concatFields?: string | string[],
      changeReason?: any
    ) => {
      const state = get();
      let newData: any;

      if (concatFields) {
        data = concatData(data, state.data, concatFields);
      }

      if (tag) {
        const proto = createObject(
          (state.data as any).__super || null,
          {
            ...tag,
            __tag: tag
          }
        );
        newData = createObject(proto, {
          ...(replace ? {} : state.data),
          ...data
        });
      } else {
        newData = extendObject(state.data, data, !replace);
      }

      Object.defineProperty(newData, '__prev', {
        value: {...state.data},
        enumerable: false,
        configurable: false,
        writable: false
      });

      set({
        data: newData,
        updatedAt: Date.now()
      });
    },

    changeValue: (
      name: string,
      value: any,
      changePristine?: boolean,
      force?: boolean,
      otherModifier?: (data: Object) => void,
      changeReason?: any
    ) => {
      if (!name) {
        return;
      }

      const state = get();
      const origin = getVariable(state.data, name, false);

      if (value === origin && !force) {
        return;
      }

      const prev = state.data;
      let data = cloneObject(state.data);

      if ((prev as any).__prev) {
        const prevData = cloneObject((prev as any).__prev);
        setVariable(prevData, name, origin);
        Object.defineProperty(data, '__prev', {
          value: prevData,
          enumerable: false,
          configurable: false,
          writable: false
        });
      } else {
        Object.defineProperty(data, '__prev', {
          value: {...prev},
          enumerable: false,
          configurable: false,
          writable: false
        });
      }

      if (value === undefined) {
        deleteVariable(data, name);
      } else {
        setVariable(data, name, value);
      }

      otherModifier?.(data);

      if (changePristine) {
        const pristine = cloneObject(state.pristine);
        setVariable(pristine, name, value);
        otherModifier?.(pristine);
        set({pristine});
      }

      set({data});
    },

    reset: () => {
      const state = get();
      set({
        data: state.pristine,
        updatedAt: Date.now()
      });
    },

    temporaryUpdateGlobalVars: (globalVar: any) => {
      const state = get();
      const chain = extractObjectChain(state.data).filter(
        (item: any) => !item.hasOwnProperty('__isTempGlobalLayer')
      );

      const idx = chain.findIndex(
        (item: any) =>
          item.hasOwnProperty('global') || item.hasOwnProperty('globalState')
      );

      if (idx !== -1) {
        chain.splice(idx + 1, 0, {
          ...globalVar,
          __isTempGlobalLayer: true
        });
      }

      const newData = createObjectFromChain(chain);
      set({data: newData});
    },

    unDoTemporaryUpdateGlobalVars: () => {
      const state = get();
      const chain = extractObjectChain(state.data).filter(
        (item: any) => !item.hasOwnProperty('__isTempGlobalLayer')
      );
      const newData = createObjectFromChain(chain);
      set({data: newData});
    },

    setCurrentAction: (action: any, resolveDefinitions?: (schema: any) => any) => {
      let finalAction = action;
      if (resolveDefinitions) {
        ['dialog', 'drawer'].forEach(key => {
          if (action[key]?.$ref) {
            finalAction = {
              ...action,
              [key]: {
                ...resolveDefinitions(action[key].$ref),
                ...action[key]
              }
            };
          }
        });
      }
      set({action: finalAction});
    },

    openDialog: (ctx, additonal, callback, scoped) => {
      const state = get();
      let chain = extractObjectChain(ctx);
      if (chain.length === 1) {
        chain.unshift(state.data);
      }
      if (additonal) {
        chain.splice(chain.length - 1, 0, additonal);
      }

      let data = createObjectFromChain(chain);
      const mappingData =
        state.action?.data ?? state.action?.dialog?.data;
      if (mappingData) {
        data = createObjectFromChain([
          getTopStore()?.downStream,
          dataMapping(mappingData, data)
        ]);
      }

      const dialogData = data;
      if (callback) {
        dialogCallbacks.set(dialogData, callback);
      }
      dialogScoped = scoped || null;

      set({
        dialogOpen: true,
        dialogData,
        dialogSchema: state.action?.dialog
      });
    },

    closeDialog: (confirmed, data) => {
      const state = get();
      const callback = dialogCallbacks.get(state.dialogData);

      set({dialogOpen: false});
      dialogScoped = null;

      if (callback) {
        dialogCallbacks.delete(state.dialogData);
        setTimeout(() => callback(confirmed, data), 200);
      }
    },

    getDialogScoped: () => dialogScoped,

    openDrawer: (ctx, additonal, callback, scoped) => {
      const state = get();
      let chain = extractObjectChain(ctx);
      if (chain.length === 1) {
        chain.unshift(state.data);
      }
      if (additonal) {
        chain.splice(chain.length - 1, 0, additonal);
      }

      let data = createObjectFromChain(chain);
      const mappingData =
        state.action?.data ?? state.action?.drawer?.data;
      if (mappingData) {
        data = createObjectFromChain([
          getTopStore()?.downStream,
          dataMapping(mappingData, data)
        ]);
      }

      const drawerData = data;
      if (callback) {
        dialogCallbacks.set(drawerData, callback);
      }
      drawerScoped = scoped || null;

      set({
        drawerOpen: true,
        drawerData,
        drawerSchema: state.action?.drawer
      });
    },

    closeDrawer: (confirmed, data) => {
      const state = get();
      const callback = dialogCallbacks.get(state.drawerData);

      set({drawerOpen: false});
      drawerScoped = null;

      if (callback) {
        dialogCallbacks.delete(state.drawerData);
        setTimeout(() => callback(confirmed, data), 200);
      }
    },

    getDrawerScoped: () => drawerScoped
  }));
}

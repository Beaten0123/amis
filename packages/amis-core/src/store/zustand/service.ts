/**
 * ServiceStore - Zustand Implementation
 * Base store for data-fetching components
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createIRendererStore} from './iRenderer';
import type {Api, Payload, fetchOptions} from '../../types';

export interface ServiceStoreState {
  // Loading states
  fetching: boolean;
  saving: boolean;
  busying: boolean;
  checking: boolean;
  initializing: boolean;

  // Messages
  msg: string;
  error: boolean;

  // Schema
  schema: any;
  schemaKey: string;
}

export interface ServiceStoreActions {
  markFetching: (fetching?: boolean) => void;
  markSaving: (saving?: boolean) => void;
  markBusying: (busying?: boolean) => void;
  reInitData: (
    data?: object,
    replace?: boolean,
    concatFields?: string | string[]
  ) => void;
  updateMessage: (msg?: string, error?: boolean) => void;
  clearMessage: () => void;
  fetchInitData: (api: Api, data?: object, options?: fetchOptions) => Promise<any>;
  fetchData: (api: Api, data?: object, options?: fetchOptions) => Promise<any>;
  saveRemote: (api: Api, data?: object, options?: fetchOptions) => Promise<any>;
  fetchSchema: (api: Api, data?: object, options?: fetchOptions) => Promise<any>;
  checkRemote: (api: Api, data?: object, options?: fetchOptions) => Promise<any>;
  setHasRemoteData: () => void;
}

export type ServiceStore = ReturnType<typeof createServiceStore>;

export function createServiceStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  fetcher?: any;
  notify?: any;
  isCancel?: (e: any) => boolean;
  translate?: (key: string) => string;
}) {
  const {
    id,
    path = '',
    parentId = '',
    fetcher = () => Promise.reject('fetcher required'),
    notify = () => {},
    isCancel = () => false,
    translate = (k: string) => k
  } = options;

  type CombinedState = ServiceStoreState & ServiceStoreActions;

  // Create base iRendererStore
  const baseStore = createIRendererStore({
    id,
    path,
    parentId
  });

  let fetchCancel: (() => void) | null = null;
  let fetchSchemaCancel: (() => void) | null = null;

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // ServiceStore specific state
    fetching: false,
    saving: false,
    busying: false,
    checking: false,
    initializing: false,
    msg: '',
    error: false,
    schema: null,
    schemaKey: '',

    // Computed: loading
    get loading() {
      const s = get();
      return s.fetching || s.saving || s.busying || s.initializing;
    },

    // Actions
    markFetching: (fetching = true) => set({fetching}),
    markSaving: (saving = true) => set({saving}),
    markBusying: (busying = true) => set({busying}),

    reInitData: (data = {}, replace = false, concatFields?: string | string[]) => {
      const state = get();
      let finalData = data;

      if (concatFields) {
        finalData = { ...data, ...state.data };
      }

      set({
        data: replace ? finalData : {...state.data, ...finalData},
        pristine: replace ? finalData : {...state.data, ...finalData}
      });
    },

    updateMessage: (msg, error = false) => {
      set({msg: msg || '', error});
    },

    clearMessage: () => set({msg: '', error: false}),

    setHasRemoteData: () => set({hasRemoteData: true}),

    fetchInitData: async (api, data = {}, options = {}) => {
      const state = get();

      if (fetchCancel) {
        fetchCancel();
        fetchCancel = null;
      }

      if (state.fetching) {
        return;
      }

      set({fetching: true});

      try {
        const json: Payload = await fetcher(api, data, {
          ...options,
          cancelExecutor: (executor: () => void) => {
            fetchCancel = executor;
          }
        });

        if (!json.ok) {
          state.updateMessage(
            (api as any)?.messages?.failed ?? json.msg ?? options.errorMessage,
            true
          );
          notify('error', state.msg);
        } else {
          set({updatedAt: Date.now()});
          const replace = !!(api as any)?.replaceData;
          state.reInitData(
            json.data,
            replace,
            (api as any)?.concatDataFields
          );
          state.setHasRemoteData();
          state.updateMessage(
            (api as any)?.messages?.success ?? json.msg ?? options.successMessage ?? json.defaultMsg
          );
        }

        set({fetching: false});
        return json;
      } catch (e) {
        if (isCancel(e)) {
          set({fetching: false});
          return;
        }

        set({fetching: false});
        console.error(e);
        const message = e?.message === 'Network Error'
          ? translate('networkError')
          : (e?.message || String(e));
        notify('error', message);
        return;
      }
    },

    fetchData: async (api, data = {}, options = {}) => {
      const state = get();

      if (fetchCancel) {
        fetchCancel();
        fetchCancel = null;
      }

      if (state.fetching) {
        return;
      }

      set({fetching: true});

      try {
        const json: Payload = await fetcher(api, data, {
          ...options,
          cancelExecutor: (executor: () => void) => {
            fetchCancel = executor;
          }
        });

        if (json.data || json.ok) {
          set({updatedAt: Date.now()});
          state.updateData(
            json.data,
            undefined,
            !!(api as any)?.replaceData,
            (api as any)?.concatDataFields,
            {type: 'api'}
          );
          state.setHasRemoteData();
        }

        if (!json.ok) {
          state.updateMessage(
            (api as any)?.messages?.failed ?? json.msg ?? options.errorMessage,
            true
          );
          notify('error', state.msg);
        } else {
          state.updateMessage(
            (api as any)?.messages?.success ?? json.msg ?? options.successMessage
          );
        }

        set({fetching: false});
        return json;
      } catch (e) {
        if (isCancel(e)) {
          set({fetching: false});
          return;
        }

        set({fetching: false});
        console.error(e);
        const message = e?.message === 'Network Error'
          ? translate('networkError')
          : (e?.message || String(e));
        notify('error', message);
        return;
      }
    },

    saveRemote: async (api, data = {}, options: fetchOptions = {}) => {
      const state = get();

      if (state.saving) {
        return;
      }

      set({saving: true});

      try {
        const json: Payload = await fetcher(api, data, {
          method: 'post',
          ...options
        });

        if (json.data || json.ok) {
          set({updatedAt: Date.now()});
          state.updateData(
            json.data,
            undefined,
            !!(api as any)?.replaceData,
            (api as any)?.concatDataFields,
            {type: 'api'}
          );
        }

        if (!json.ok) {
          state.updateMessage(
            (api as any)?.messages?.failed ?? json.msg ?? options.errorMessage ?? translate('saveFailed'),
            true
          );
          set({saving: false});
          throw new Error(state.msg);
        }

        state.updateMessage(
          (api as any)?.messages?.success ?? json.msg ?? options.successMessage
        );

        set({saving: false});
        return json.data;
      } catch (e) {
        set({saving: false});

        if (isCancel(e)) {
          return;
        }

        console.error(e);
        throw e;
      }
    },

    fetchSchema: async (api, data = {}, options: fetchOptions = {}) => {
      const state = get();

      if (fetchSchemaCancel) {
        fetchSchemaCancel();
        fetchSchemaCancel = null;
      }

      if (state.initializing) {
        return;
      }

      set({initializing: true});

      try {
        let finalApi = api;
        if (typeof api === 'string') {
          finalApi = api + (api.includes('?') ? '&' : '?') + '_replace=1';
        } else {
          finalApi = {
            ...(api as any),
            url: (api as any).url + ((api as any).url.includes('?') ? '&' : '?') + '_replace=1'
          };
        }

        const json: Payload = await fetcher(finalApi, data, {
          method: 'post',
          ...options,
          cancelExecutor: (executor: () => void) => {
            fetchSchemaCancel = executor;
          }
        });

        if (!json.ok) {
          state.updateMessage(
            (api as any)?.messages?.failed ?? json.msg ?? options.errorMessage ?? translate('fetchFailed'),
            true
          );
          notify('error', state.msg);
        } else {
          if (json.data) {
            const schema = Array.isArray(json.data)
              ? json.data
              : {
                  ...(json.data?.type ? {} : {type: 'wrapper', wrap: false}),
                  ...(json.data || {})
                };
            set({schema, schemaKey: String(Date.now())});
            if ((json.data as any)?.data) {
              state.updateData(
                (json.data as any).data,
                undefined,
                !!(api as any)?.replaceData,
                (api as any)?.concatDataFields,
                {type: 'api'}
              );
            }
          }

          state.updateMessage(
            (api as any)?.messages?.success ?? json.msg ?? options.successMessage
          );
        }

        set({initializing: false});
        return json.data;
      } catch (e) {
        set({initializing: false});

        if (isCancel(e)) {
          return;
        }

        console.error(e);
        const message = e?.message === 'Network Error'
          ? translate('networkError')
          : (e?.message || String(e));
        notify('error', message);
        return;
      }
    },

    checkRemote: async (api, data = {}, options = {}) => {
      const state = get();

      if (state.checking) {
        return;
      }

      set({checking: true});

      try {
        const json: Payload = await fetcher(api, data, options);

        if (json.ok) {
          state.updateData(
            json.data,
            undefined,
            !!(api as any)?.replaceData,
            (api as any)?.concatDataFields
          );
        }

        if (!json.ok) {
          throw new Error(json.msg);
        }

        set({checking: false});
        return json.data;
      } catch (e) {
        set({checking: false});
        console.error(e);
        throw e;
      }
    }
  }));
}

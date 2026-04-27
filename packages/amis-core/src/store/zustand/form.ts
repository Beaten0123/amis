/**
 * FormStore - Zustand Implementation
 * Store for form state management
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';
import type {DataChangeReason} from '../../types';

export interface FormStoreState {
  // Form state
  inited: boolean;
  validated: boolean;
  submited: boolean;
  submiting: boolean;
  savedData: any;
  canAccessSuperData: boolean;
  persistData: string | boolean;
  restError: string[];

  // Items (managed separately via store manager)
  items: any[];
}

export interface FormStoreActions {
  // Initialization
  initData: (data: object, skipSetPristine?: boolean) => void;

  // Value management
  setValues: (
    values: object,
    tag?: object,
    replace?: boolean,
    concatFields?: string | string[],
    changeReason?: DataChangeReason
  ) => void;
  setValueByName: (name: string, value: any) => void;
  deleteValueByName: (name: string) => void;

  // Submission
  submit: () => Promise<any>;
  reset: () => void;

  // Validation
  validate: () => Promise<boolean>;

  // Persistence
  persistSubmit: () => void;
  persistCancel: () => void;
}

export type FormStore = ReturnType<typeof createFormStore>;

export function createFormStore(options: {
  id: string;
  path?: string;
  parentId?: string;
}) {
  const {id, path = '', parentId = ''} = options;

  type CombinedState = FormStoreState & FormStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // FormStore specific state
    inited: false,
    validated: false,
    submited: false,
    submiting: false,
    savedData: undefined,
    canAccessSuperData: true,
    persistData: '',
    restError: [],
    items: [],

    // Computed: loading
    get loading() {
      const s = get();
      return s.saving || s.fetching;
    },

    // Computed: errors
    get errors() {
      const state = get();
      const errors: Record<string, string[]> = {};
      state.items.forEach((item: any) => {
        if (!item.valid && item.error) {
          errors[item.name] = errors[item.name]
            ? [...errors[item.name], item.error]
            : [item.error];
        }
      });
      return errors;
    },

    // Computed: valid
    get valid() {
      const state = get();
      return state.items.every((item: any) => item.valid) && !state.restError.length;
    },

    // Computed: validating
    get validating() {
      const state = get();
      return state.items.some((item: any) => item.validating);
    },

    // Computed: isPristine
    get isPristine() {
      const state = get();
      return JSON.stringify(state.pristine) === JSON.stringify(state.data);
    },

    // Computed: modified
    get modified() {
      const state = get();
      if (state.savedData) {
        return state.savedData !== state.data;
      }
      return !state.isPristine;
    },

    // Actions
    initData: (data = {}, skipSetPristine = false) => {
      const state = get();
      state.initData(data, skipSetPristine);
      set({inited: true});
    },

    setValues: (values, tag, replace, concatFields, changeReason) => {
      const state = get();
      state.updateData(values, tag, replace, concatFields, changeReason);
    },

    setValueByName: (name, value) => {
      const state = get();
      state.changeValue(name, value, true);
    },

    deleteValueByName: (name) => {
      const state = get();
      state.changeValue(name, undefined, true);
    },

    submit: async () => {
      const state = get();
      set({submiting: true});

      try {
        const valid = await state.validate();
        if (!valid) {
          set({submiting: false, submited: false});
          return false;
        }

        set({
          submited: true,
          validated: true,
          savedData: {...state.data}
        });

        return true;
      } catch (e) {
        set({submiting: false});
        throw e;
      }
    },

    reset: () => {
      const state = get();
      state.reset();
      set({
        submited: false,
        validated: false
      });
    },

    validate: async () => {
      const state = get();
      const results = await Promise.all(
        state.items.map((item: any) => item.validate?.())
      );
      const valid = results.every(r => r);
      set({validated: valid});
      return valid;
    },

    persistSubmit: () => {
      const state = get();
      if (typeof state.persistData === 'string') {
        try {
          localStorage.setItem(
            state.persistData,
            JSON.stringify(state.data)
          );
        } catch (e) {
          console.warn('Failed to persist form data:', e);
        }
      }
    },

    persistCancel: () => {
      const state = get();
      if (typeof state.persistData === 'string') {
        try {
          localStorage.removeItem(state.persistData);
        } catch (e) {
          console.warn('Failed to clear persisted form data:', e);
        }
      }
    },

    // Helper to add/remove items
    addItem: (item: any) => {
      set(state => ({
        items: [...state.items, item]
      }));
    },

    removeItem: (itemId: string) => {
      set(state => ({
        items: state.items.filter((i: any) => i.id !== itemId)
      }));
    },

    getItemByName: (name: string) => {
      const state = get();
      return state.items.find((item: any) => item.name === name);
    }
  }));
}

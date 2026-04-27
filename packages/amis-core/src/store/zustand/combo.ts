/**
 * ComboStore - Zustand Implementation
 * Store for combo/array form fields
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createServiceStore} from './service';

export interface ComboStoreState {
  // Multiple mode
  multiple: boolean;

  // Items
  formsRef: string[];
  length: number;

  // Pagination
  perPage: number;
  page: number;

  // Limits
  minLength: number;
  maxLength: number;

  // Active
  activeKey: number;

  // Validation
  memberValidMap: Record<string, boolean>;

  // Unique groups
  uniques: Record<string, string[]>;
}

export interface ComboStoreActions {
  // Add/remove forms
  addForm: (formId: string, index?: number) => void;
  removeForm: (formId: string) => void;
  getForms: () => string[];

  // Length management
  setLength: (length: number) => void;

  // Pagination
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Active
  setActiveKey: (key: number) => void;

  // Validation
  setMemberValid: (formId: string, valid: boolean) => void;
  getMemberValid: (formId: string) => boolean;

  // Unique groups
  addUnique: (name: string, formId: string) => void;
  removeUnique: (name: string, formId: string) => void;
  getUniqueItems: (name: string) => string[];

  // Computed
  get addable(): boolean;
  get removable(): boolean;
}

export type ComboStore = ReturnType<typeof createComboStore>;

export function createComboStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  multiple?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  const {
    id,
    path = '',
    parentId = '',
    multiple = false,
    minLength = 0,
    maxLength = 0
  } = options;

  type CombinedState = ComboStoreState & ComboStoreActions;

  const baseStore = createServiceStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // ComboStore specific state
    multiple,
    formsRef: [],
    length: 0,
    perPage: 0,
    page: 1,
    minLength,
    maxLength,
    activeKey: 0,
    memberValidMap: {},
    uniques: {},

    // Actions
    addForm: (formId, index) => {
      set(state => {
        const newForms = [...state.formsRef];
        if (index !== undefined) {
          newForms.splice(index, 0, formId);
        } else {
          newForms.push(formId);
        }
        return {
          formsRef: newForms,
          length: newForms.length
        };
      });
    },

    removeForm: (formId) => {
      set(state => {
        const newForms = state.formsRef.filter(id => id !== formId);
        return {
          formsRef: newForms,
          length: newForms.length
        };
      });
    },

    getForms: () => get().formsRef,

    setLength: (length) => set({length}),

    setPage: (page) => set({page}),
    setPerPage: (perPage) => set({perPage}),
    setActiveKey: (activeKey) => set({activeKey}),

    setMemberValid: (formId, valid) => {
      set(state => ({
        memberValidMap: {
          ...state.memberValidMap,
          [formId]: valid
        }
      }));
    },

    getMemberValid: (formId) => {
      return get().memberValidMap[formId] ?? true;
    },

    addUnique: (name, formId) => {
      set(state => ({
        uniques: {
          ...state.uniques,
          [name]: [...(state.uniques[name] || []), formId]
        }
      }));
    },

    removeUnique: (name, formId) => {
      set(state => ({
        uniques: {
          ...state.uniques,
          [name]: (state.uniques[name] || []).filter(id => id !== formId)
        }
      }));
    },

    getUniqueItems: (name) => {
      return get().uniques[name] || [];
    },

    // Computed
    get addable() {
      const state = get();
      if (state.maxLength && state.length >= state.maxLength) {
        return false;
      }
      return true;
    },

    get removable() {
      const state = get();
      if (state.minLength && state.minLength >= state.length) {
        return false;
      }
      return true;
    }
  }));
}

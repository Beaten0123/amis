/**
 * FormItemStore - Zustand Implementation
 * Individual form field state management
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createBaseStore, registerStoreInManager} from './baseStore';
import type {FormItemStoreState} from './types';
import {str2rules} from '../../utils/validations';
import {isExpression} from '../../utils/formula';
import {tokenize} from '../../utils/tokenize';

export interface FormItemStoreActions {
  // Value management
  changeValue: (value: any, changePristine?: boolean) => void;
  setValue: (value: any) => void;
  getValue: () => any;

  // Validation
  validate: () => Promise<boolean>;
  setError: (error: string) => void;
  clearError: () => void;

  // Configuration
  config: (options: FormItemConfig) => void;

  // Internal
  changeTmpValue: (value: any, reason?: string) => void;
  setIsControlled: (controlled: boolean) => void;
}

export interface FormItemConfig {
  name?: string;
  id?: string;
  type?: string;
  required?: boolean;
  value?: any;
  rules?: any;
  messages?: any;
  validations?: any;
  multiple?: boolean;
  delimiter?: string;
  valueField?: string;
  labelField?: string;
  joinValues?: boolean;
  extractValue?: boolean;
  selectFirst?: boolean;
  autoFill?: any;
  clearValueOnHidden?: boolean;
  validateApi?: any;
  minLength?: number;
  maxLength?: number;
  validateOnChange?: boolean;
  label?: string;
}

export type FormItemStore = ReturnType<typeof createFormItemStore>;

export function createFormItemStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  name?: string;
  value?: any;
}) {
  const {id, path = '', parentId = '', name = '', value} = options;

  type CombinedState = FormItemStoreState & FormItemStoreActions & {
      tmpValue: any;
      isControlled: boolean;
      storeType: 'FormItemStore';
    };

  const baseStore = createBaseStore({
    id,
    path,
    storeType: 'FormItemStore',
    parentId
  });

  let validationRules: any = {};
  let validationMessages: any = {};
  let required = false;
  let multiple = false;
  let delimiter = ',';
  let joinValues = true;
  let extractValue = false;

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // FormItemStore specific state
    name,
    value: value ?? '',
    prinstine: undefined,
    rules: {},
    messages: {},
    valid: true,
    error: '',
    validating: false,
    tmpValue: value ?? '',
    isControlled: false,

    // Configuration
    config: (config: FormItemConfig) => {
      const state = get();

      if (config.name) {
        set({name: config.name});
      }

      // Handle expressions for value
      let finalValue = config.value;
      if (config.value && typeof config.value === 'string' && isExpression(config.value)) {
        finalValue = tokenize(config.value, state.data);
      }

      // Build validation rules
      const rules = config.validations || config.rules;
      if (rules) {
        validationRules = config.validations
          ? {...str2rules(config.validations), ...str2rules(rules)}
          : str2rules(rules);
      }

      validationMessages = config.messages || {};
      required = !!config.required;
      multiple = !!config.multiple;
      delimiter = config.delimiter || ',';
      joinValues = config.joinValues !== false;
      extractValue = !!config.extractValue;

      set({
        rules: validationRules,
        messages: validationMessages,
        value: finalValue,
        pristine: finalValue
      });

      // Initialize tmpValue
      if (finalValue !== undefined) {
        set({tmpValue: finalValue});
      }
    },

    // Value actions
    changeValue: (value, changePristine = false) => {
      const state = get();

      set({
        value,
        ...(changePristine ? {prinstine: value} : {})
      });

      if (changePristine) {
        // Also update pristine
        get().setValue(value);
      }
    },

    setValue: (value) => {
      set({value});
    },

    getValue: () => {
      return get().value;
    },

    // Validation
    validate: async () => {
      const state = get();
      set({validating: true, error: ''});

      try {
        // Simple validation - check required
        if (required) {
          const val = state.value;
          if (
            val === undefined ||
            val === null ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)
          ) {
            set({
              validating: false,
              valid: false,
              error: validationMessages?.required || '此字段必填'
            });
            return false;
          }
        }

        set({validating: false, valid: true, error: ''});
        return true;
      } catch (e) {
        set({
          validating: false,
          valid: false,
          error: String(e)
        });
        return false;
      }
    },

    setError: (error) => {
      set({error, valid: false});
    },

    clearError: () => {
      set({error: '', valid: true});
    },

    // Internal
    changeTmpValue: (value, reason = '') => {
      set({tmpValue: value});
    },

    setIsControlled: (controlled) => {
      set({isControlled: controlled});
    }
  }));
}

/**
 * Create and register a FormItemStore
 */
export function createAndRegisterFormItemStore(options: {
  id: string;
  path?: string;
  parentId?: string;
  name?: string;
  value?: any;
}) {
  const store = createFormItemStore(options);
  const state = store.getState();

  registerStoreInManager(store, {
    id: options.id,
    path: options.path || '',
    storeType: 'FormItemStore',
    parentId: options.parentId
  });

  return store;
}

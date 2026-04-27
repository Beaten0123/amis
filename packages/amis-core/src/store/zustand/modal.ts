/**
 * ModalStore - Zustand Implementation
 * Store for modal/dialog state
 * Migrated from MobX-State-Tree
 */

import {create} from 'zustand';
import {createIRendererStore} from './iRenderer';

export interface ModalStoreState {
  opened: boolean;
  content: any;
  contentType: string;
  draggable: boolean;
  size: string;
  schema: any;
}

export interface ModalStoreActions {
  open: (content?: any, schema?: any) => void;
  close: () => void;
  setContent: (content: any) => void;
  setDraggable: (draggable: boolean) => void;
  setSize: (size: string) => void;
}

export type ModalStore = ReturnType<typeof createModalStore>;

export function createModalStore(options: {
  id: string;
  path?: string;
  parentId?: string;
}) {
  const {id, path = '', parentId = ''} = options;

  type CombinedState = ModalStoreState & ModalStoreActions;

  const baseStore = createIRendererStore({
    id,
    path,
    parentId
  });

  return create<CombinedState>()((set, get) => ({
    ...baseStore.getState(),

    // ModalStore specific state
    opened: false,
    content: null,
    contentType: 'dialog',
    draggable: false,
    size: 'md',
    schema: null,

    // Actions
    open: (content, schema) => {
      set({
        opened: true,
        content: content || null,
        schema: schema || null
      });
    },

    close: () => {
      set({
        opened: false,
        content: null,
        schema: null
      });
    },

    setContent: (content) => set({content}),

    setDraggable: (draggable) => set({draggable}),

    setSize: (size) => set({size})
  }));
}

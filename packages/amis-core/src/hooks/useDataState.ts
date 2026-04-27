import {useMemo} from 'react';

export type ComponentState =
  | 'open'
  | 'closed'
  | 'active'
  | 'inactive'
  | 'disabled'
  | 'selected'
  | 'unselected'
  | 'expanded'
  | 'collapsed'
  | 'loading'
  | 'error';

/**
 * Data State Hook — 将组件状态映射为 data-state 属性
 * 用于支持 CSS data-state 选择器和声明式动画
 */
export function useDataState(
  states: Record<string, boolean | undefined>
): Record<string, string> {
  return useMemo(() => {
    const attrs: Record<string, string> = {};

    // Primary state
    const primaryState = derivePrimaryState(states);
    if (primaryState) {
      attrs['data-state'] = primaryState;
    }

    // Secondary states as data-state-* attributes
    for (const [key, value] of Object.entries(states)) {
      if (value !== undefined && key !== derivePrimaryStateKey(states)) {
        attrs[`data-state-${key}`] = value ? 'true' : 'false';
      }
    }

    return attrs;
  }, [states]);
}

function derivePrimaryStateKey(
  states: Record<string, boolean | undefined>
): string | null {
  if (states.disabled !== undefined) return 'disabled';
  if (states.loading !== undefined) return 'loading';
  if (states.error !== undefined) return 'error';
  if (states.open !== undefined) return 'open';
  if (states.active !== undefined) return 'active';
  if (states.selected !== undefined) return 'selected';
  if (states.expanded !== undefined) return 'expanded';
  return null;
}

function derivePrimaryState(
  states: Record<string, boolean | undefined>
): ComponentState | null {
  if (states.disabled) return 'disabled';
  if (states.loading) return 'loading';
  if (states.error) return 'error';
  if (states.open !== undefined) return states.open ? 'open' : 'closed';
  if (states.active !== undefined) return states.active ? 'active' : 'inactive';
  if (states.selected !== undefined)
    return states.selected ? 'selected' : 'unselected';
  if (states.expanded !== undefined)
    return states.expanded ? 'expanded' : 'collapsed';
  return null;
}

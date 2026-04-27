import {useCallback} from 'react';

export interface KeyboardNavOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  onFocus?: (index: number) => void;
}

/**
 * Keyboard Navigation Hook — 方向键导航
 * 用于 Tabs, Select, Menu, CollapseGroup 等组件
 */
export function useKeyboardNavigation(
  itemCount: number,
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  options: KeyboardNavOptions = {}
) {
  const {
    orientation = 'horizontal',
    loop = true,
    onSelect,
    onEscape,
    onFocus,
  } = options;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          if (!isHorizontal) return;
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= itemCount) nextIndex = loop ? 0 : itemCount - 1;
          break;
        case 'ArrowLeft':
          if (!isHorizontal) return;
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = loop ? itemCount - 1 : 0;
          break;
        case 'ArrowDown':
          if (!isVertical) return;
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= itemCount) nextIndex = loop ? 0 : itemCount - 1;
          break;
        case 'ArrowUp':
          if (!isVertical) return;
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) nextIndex = loop ? itemCount - 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = itemCount - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(currentIndex);
          return;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          return;
        default:
          return;
      }

      setCurrentIndex(nextIndex);
      onFocus?.(nextIndex);
    },
    [currentIndex, itemCount, orientation, loop, onSelect, onEscape, onFocus]
  );

  return handleKeyDown;
}

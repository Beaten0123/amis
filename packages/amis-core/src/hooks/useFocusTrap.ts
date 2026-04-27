import {useEffect, useRef, useCallback} from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'details',
  'summary',
].join(', ');

/**
 * Focus Trap Hook — 限制 Tab 焦点在容器内循环
 * 用于 Modal, Drawer 等需要焦点捕获的组件
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // 保存当前焦点
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 聚焦到容器内第一个可聚焦元素
    const focusableElements = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTORS
    );
    if (focusableElements.length > 0) {
      // 优先聚焦到 [autofocus] 或第一个元素
      const autofocusEl = container.querySelector<HTMLElement>('[autofocus]');
      (autofocusEl || focusableElements[0]).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(
        el =>
          !el.hasAttribute('disabled') &&
          el.tabIndex !== -1 &&
          el.offsetParent !== null
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // 恢复之前的焦点
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === 'function'
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}

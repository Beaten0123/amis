import {useRef, useCallback, useEffect} from 'react';

/**
 * Live Region Hook — ARIA live region 播报
 * 用于动态内容更新时通知屏幕阅读器
 */
export function useLiveRegion(
  politeness: 'polite' | 'assertive' = 'polite'
) {
  const regionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 创建隐藏的 live region
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(region);
    regionRef.current = region;

    return () => {
      document.body.removeChild(region);
    };
  }, [politeness]);

  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = '';
      // 使用 microtask 确保 DOM 更新
      Promise.resolve().then(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      });
    }
  }, []);

  return {announce};
}

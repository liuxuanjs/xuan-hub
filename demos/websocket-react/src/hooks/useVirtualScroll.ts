/**
 * 虚拟滚动 Hook
 * 用于优化大量消息列表的渲染性能
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface VirtualScrollOptions {
  /** 容器高度 */
  containerHeight: number;
  /** 每项估计高度 */
  itemHeight: number;
  /** 上下缓冲区大小（项数） */
  overscan: number;
  /** 是否启用动态高度 */
  dynamicHeight?: boolean;
}

export interface VirtualScrollResult<T> {
  /** 可见项列表 */
  visibleItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  /** 总高度 */
  totalHeight: number;
  /** 容器 props */
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  };
  /** 内容 props */
  contentProps: {
    style: React.CSSProperties;
  };
  /** 滚动到指定位置 */
  scrollTo: (index: number, behavior?: ScrollBehavior) => void;
  /** 滚动到底部 */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** 当前滚动位置 */
  scrollTop: number;
  /** 是否在底部 */
  isAtBottom: boolean;
}

const DEFAULT_OPTIONS: VirtualScrollOptions = {
  containerHeight: 500,
  itemHeight: 60,
  overscan: 5,
  dynamicHeight: false,
};

/**
 * 虚拟滚动 Hook
 */
export function useVirtualScroll<T>(
  items: T[],
  options: Partial<VirtualScrollOptions> = {}
): VirtualScrollResult<T> {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeights = useRef<Map<number, number>>(new Map());
  const lastItemCount = useRef(items.length);
  const shouldAutoScroll = useRef(true);

  // 计算每项的位置
  const getItemPosition = useCallback(
    (index: number): { top: number; height: number } => {
      if (opts.dynamicHeight) {
        let top = 0;
        for (let i = 0; i < index; i++) {
          top += itemHeights.current.get(i) || opts.itemHeight;
        }
        return {
          top,
          height: itemHeights.current.get(index) || opts.itemHeight,
        };
      }
      return {
        top: index * opts.itemHeight,
        height: opts.itemHeight,
      };
    },
    [opts.dynamicHeight, opts.itemHeight]
  );

  // 计算总高度
  const totalHeight = useMemo(() => {
    if (opts.dynamicHeight) {
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += itemHeights.current.get(i) || opts.itemHeight;
      }
      return height;
    }
    return items.length * opts.itemHeight;
  }, [items.length, opts.dynamicHeight, opts.itemHeight]);

  // 计算可见范围
  const { startIndex, endIndex } = useMemo(() => {
    const viewportHeight = opts.containerHeight;

    // 找到开始索引
    let start = 0;
    let accumulatedHeight = 0;

    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.current.get(i) || opts.itemHeight;
      if (accumulatedHeight + height >= scrollTop) {
        start = i;
        break;
      }
      accumulatedHeight += height;
      start = i + 1;
    }

    // 找到结束索引
    let end = start;
    accumulatedHeight = 0;

    for (let i = start; i < items.length; i++) {
      const height = itemHeights.current.get(i) || opts.itemHeight;
      accumulatedHeight += height;
      end = i + 1;
      if (accumulatedHeight >= viewportHeight) {
        break;
      }
    }

    // 添加缓冲区
    return {
      startIndex: Math.max(0, start - opts.overscan),
      endIndex: Math.min(items.length, end + opts.overscan),
    };
  }, [items.length, scrollTop, opts.containerHeight, opts.itemHeight, opts.overscan]);

  // 计算可见项
  const visibleItems = useMemo(() => {
    const result: Array<{ item: T; index: number; style: React.CSSProperties }> = [];

    for (let i = startIndex; i < endIndex; i++) {
      const position = getItemPosition(i);
      result.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: position.top,
          left: 0,
          right: 0,
          height: opts.dynamicHeight ? 'auto' : position.height,
          minHeight: opts.dynamicHeight ? position.height : undefined,
        },
      });
    }

    return result;
  }, [items, startIndex, endIndex, getItemPosition, opts.dynamicHeight]);

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // 检查是否在底部
    const isBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
    shouldAutoScroll.current = isBottom;
  }, []);

  // 滚动到指定位置
  const scrollTo = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;

      const position = getItemPosition(index);
      containerRef.current.scrollTo({
        top: position.top,
        behavior,
      });
    },
    [getItemPosition]
  );

  // 滚动到底部
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  }, []);

  // 新消息到达时自动滚动
  useEffect(() => {
    if (items.length > lastItemCount.current && shouldAutoScroll.current) {
      // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
    lastItemCount.current = items.length;
  }, [items.length, scrollToBottom]);

  // 检查是否在底部
  const isAtBottom = useMemo(() => {
    if (!containerRef.current) return true;
    const container = containerRef.current;
    return Math.abs(container.scrollHeight - scrollTop - container.clientHeight) < 10;
  }, [scrollTop]);

  return {
    visibleItems,
    totalHeight,
    containerProps: {
      ref: containerRef,
      style: {
        height: opts.containerHeight,
        overflow: 'auto',
        position: 'relative',
      },
      onScroll: handleScroll,
    },
    contentProps: {
      style: {
        height: totalHeight,
        position: 'relative',
      },
    },
    scrollTo,
    scrollToBottom,
    scrollTop,
    isAtBottom,
  };
}

/**
 * 更新项目高度（用于动态高度场景）
 */
export function useItemHeight(
  index: number,
  ref: React.RefObject<HTMLDivElement>,
  heightMap: React.MutableRefObject<Map<number, number>>
): void {
  useEffect(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      if (heightMap.current.get(index) !== height) {
        heightMap.current.set(index, height);
      }
    }
  });
}

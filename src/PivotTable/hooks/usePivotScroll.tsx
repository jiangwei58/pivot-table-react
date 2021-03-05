import useScrollSync, { ScrollFunction, ScrollParams } from './useScrollSync';

export interface ScrollData {
  leftTreeScrollLeft: number;
  listScrollLeft: number;
  contentScrollTop: number;
  onScroll: (type: 'left' | 'right', params: ScrollParams) => void;
  onLeftScroll: ScrollFunction;
  onRightScroll: ScrollFunction;
}

function usePivotScroll(): [ScrollData] {
  const [scrollParams, onScroll] = useScrollSync(); // 控制左右scrollTop
  const [scrollLeftParams, onLeftScroll] = useScrollSync(); // 控制左侧上下部分scrollLeft
  const [scrollRightParams, onRightScroll] = useScrollSync(); // 控制右侧上下部分scrollLeft

  const handleScroll = (type: 'left' | 'right', params: ScrollParams) => {
    const onScrollFunc = type === 'left' ? onLeftScroll : onRightScroll;
    onScrollFunc(params);
    onScroll({ ...scrollParams, scrollTop: params.scrollTop });
  };

  return [
    {
      leftTreeScrollLeft: scrollLeftParams.scrollLeft,
      listScrollLeft: scrollRightParams.scrollLeft,
      contentScrollTop: scrollParams.scrollTop,
      onScroll: handleScroll,
      onLeftScroll,
      onRightScroll,
    },
  ];
}

export default usePivotScroll;

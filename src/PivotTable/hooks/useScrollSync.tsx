import { useState } from 'react';

export interface UseScrollSyncProps {}

export interface ScrollParams {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
}

export type ScrollFunction = (params: ScrollParams) => void;

function useScrollSync(): [ScrollParams, ScrollFunction] {
  const [scrollParams, setScrollParams] = useState<ScrollParams>({
    clientHeight: 0,
    clientWidth: 0,
    scrollHeight: 0,
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
  });

  const onScroll = (params: ScrollParams) => {
    setScrollParams(params);
  };

  return [scrollParams, onScroll];
}

export default useScrollSync;

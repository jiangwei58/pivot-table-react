import { SortOrder } from './interface';

export const DEFAULT_CELL_WIDTH = 120; // 默认宽度
export const DEFAULT_CELL_HEIGHT = 28; // 默认高度

export const SCROLL_WIDTH = 17; // 滚动条宽度

export const LEFT_PANEL_MAX_SCALE = 0.5; // 左侧最多占用的比例

// 排序默认值
export const defaultSort = {
  sortField: [],
  sortValue: [],
  indicator: false,
  sortOrder: SortOrder.NO_ORDER,
};

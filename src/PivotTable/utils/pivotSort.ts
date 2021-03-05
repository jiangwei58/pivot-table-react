import { get, isEqual, groupBy, flatMap, isUndefined } from 'lodash';
import { PivotRequestCell, PivotDataObject, PivotSortProps, SortOrder, CellValue } from '../interface';

// 获取下一个排序值
export const getNextOrder = (sortOrder: SortOrder, reClick: boolean) => {
  // 非重复当前的cell
  if (!reClick) {
    return SortOrder.ASC;
  }
  if (sortOrder === SortOrder.NO_ORDER) {
    return SortOrder.ASC;
  } else if (sortOrder === SortOrder.ASC) {
    return SortOrder.DESC;
  } else {
    return SortOrder.NO_ORDER;
  }
};

// 自定义排序方法
export const customSort = (sortOrder: SortOrder = SortOrder.ASC, prevValue: CellValue, nextValue: CellValue) => {
  if (prevValue == null && nextValue == null) return 0;

  if (prevValue == null && nextValue !== null && typeof nextValue !== 'undefined') {
    return sortOrder === SortOrder.ASC ? 1 : -1;
  }

  if (nextValue == null && prevValue !== null && typeof prevValue !== 'undefined') {
    return sortOrder === SortOrder.ASC ? -1 : 1;
  }

  if (typeof prevValue === 'string' && typeof nextValue === 'number') {
    return sortOrder === SortOrder.ASC ? 1 : -1;
  }

  if (typeof prevValue === 'number' && typeof nextValue === 'string') {
    return sortOrder === SortOrder.ASC ? -1 : 1;
  }

  if (typeof prevValue === 'string' && typeof nextValue === 'string') {
    if (!prevValue && !nextValue) return 0;
    if (!prevValue && nextValue) return sortOrder === SortOrder.ASC ? 1 : -1;
    if (prevValue && !nextValue) return sortOrder === SortOrder.ASC ? -1 : 1;
    return sortOrder === SortOrder.ASC ? prevValue.localeCompare(nextValue) : nextValue.localeCompare(prevValue);
  }

  if (typeof prevValue === 'number' && typeof nextValue === 'number') {
    if (prevValue > nextValue) return sortOrder === SortOrder.ASC ? 1 : -1;
    if (prevValue < nextValue) return sortOrder === SortOrder.ASC ? -1 : 1;
    return 0;
  }

  return 0;
};

// 维度排序
export const sortByDimission = (sortOrder: SortOrder = SortOrder.ASC) => (prev: PivotRequestCell, next: PivotRequestCell) => {
  const { value: prevValue } = prev;
  const { value: nextValue } = next;
  return customSort(sortOrder, prevValue, nextValue);
};

// 指标排序
export const sortByIndicator = (data: PivotDataObject, topTreeId: number, sortOrder: SortOrder = SortOrder.ASC) => (
  prev: PivotRequestCell,
  next: PivotRequestCell,
) => {
  const prevValue = get(data, `${prev.id}-${topTreeId}`);
  const nextValue = get(data, `${next.id}-${topTreeId}`);
  return customSort(sortOrder, prevValue, nextValue);
};

// 格式化数据时排序
export const sortInTree = (treeListData: PivotRequestCell[], indexNos: number[] = [], sort?: PivotSortProps, data?: PivotDataObject) => {
  let newData = treeListData;
  if (sort && sort.sortOrder !== SortOrder.NO_ORDER && isEqual(sort.sortField, indexNos)) {
    // 按indexNo分组，把需要排序的数据排序玩后再合在一起
    const groupArray = groupBy(treeListData, (item) => item.indexNo);
    newData = flatMap(groupArray, (groupItem) => {
      // 有指标字段id和data数据识别为指标排序，反之为维度排序
      const sortFunc = !isUndefined(sort.id) && data ? sortByIndicator(data, sort.id, sort.sortOrder) : sortByDimission(sort.sortOrder);
      return groupItem.sort(sortFunc);
    });
  }
  return newData;
};

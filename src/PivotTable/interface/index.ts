import { CollectionProps, GridProps } from 'react-virtualized';
import { NumbericColumnState, PivotStyleCommon, PivotTableStyle, TextColumnState } from './style';

export interface CommonChildProps extends Pick<CollectionProps | GridProps, 'width' | 'height' | 'style' | 'scrollTop' | 'scrollLeft' | 'onScroll'> {
  styleConfig: PivotStyleConfig;
}

// 单元格数据 (数字、字符串、null、undefined)
export type CellValue = string | number | null | undefined;

// 字段类型
export type FieldsType = 'text' | 'number' | 'date';

// 字段结构
export interface FieldsProps {
  type: FieldsType;
  colType?: FieldsType;
  colName?: string;
  indexNo: number;
  no: number;
  children?: FieldsProps[];
}

export interface FieldsTypeInterface {
  [indexNo: number]: FieldsType;
}

// 基础视图结构
export interface ReportView {
  styleConfig: PivotTableStyle;
  x: FieldsProps[];
  y: FieldsProps[];
}

// 透视图render数据
export interface PivotOptionType {
  pivotTable: PivotInterface;
  fieldsType: FieldsTypeInterface;
}

// 透视图数据
export interface PivotInterface {
  data: PivotDataObject;
  leftTree: PivotRequestCell[];
  topTree: PivotRequestCell[];
  firstPathHeaderNames: PivotHeadTitle;
  topLeafNode?: PivotRequestCell[];
}

// 头标题
export interface PivotHeadTitle {
  x: string[];
  y: string[];
}

// 基础单条数据结构
export interface PivotRequestCell {
  indexNo: number;
  value: CellValue;
  id?: number; // 前后约定的序号, 用于在data里面取值，叶子节点
  children?: PivotRequestCell[];
}

export interface PivotBaseCell {
  level: number; // 层级
  isLeaf: boolean; // 是否叶子节点
  indexNos: number[];
  spaceOffset: number; // 占位偏移量
  spaceSize: number; // 占位空间大小
  spaceLevel: number; // 占位层级大小
  offsetIndexNos?: number[]; // 占位偏移indexNo
}

// 头树单条结构
export interface PivotTreeCell extends PivotBaseCell, PivotRequestCell {
  children: undefined;
  values: CellValue[];
  leafIndexNos?: number[]; // 叶子节点indexNo
  indicator?: boolean; // 是否虚拟指标
}

// 左上头部数据结构
export interface PivotHeaderCell extends PivotBaseCell {
  indexNo: number;
  value: CellValue;
  children?: PivotRequestCell[];
}

// 视图XY的键值对结构
export interface PivotXYObject {
  [indexNo: number]: FieldsProps & { indexNos: number[] };
  length: number;
  maxLevel: number;
  maxDeepIndexNos: number[];
}

// 列表数据
export interface PivotDataObject {
  [dataPath: string]: string | number;
}

// 排序
export interface PivotSortProps {
  sortField: number[];
  sortValue: CellValue[];
  indicator: boolean;
  sortOrder: SortOrder;
  id?: number;
}

// 全局的排序
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
  NO_ORDER = '',
}

// 格式化后的数据
export interface UsePivotData {
  xObject: PivotXYObject;
  yObject: PivotXYObject;
  headerList: PivotHeaderCell[];
  topTreeList: PivotTreeCell[];
  leftTreeList: PivotTreeCell[];
  data: PivotDataObject;
}

// 布局结构
export interface PivotLayoutConfig {
  topHeight: number;
  leftWidth: number;
  rightWidth: number;
  contentHeight: number;
  isSplitMode: boolean; // 是否分开的模式
  rightPaddingWidth: number; // 右侧填充大小
}

// 样式数据结构
export interface PivotStyleConfig {
  common: PivotStyleCommon;
  data: {
    [indexNo: string]: (TextColumnState | NumbericColumnState) & { width?: number };
  };
}

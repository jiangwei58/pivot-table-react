export type CombineStatus = 'combine' | 'notCombine';

export type TextAlign = 'left' | 'center' | 'right';

export type DecimalType = 'equal' | 'atmost';

export enum DataUnitFormat {
  AUTO = 'auto',
  PERCENT = 'percent',
  THOUSAND = 'thousand',
  THENTHOUSAND = 'tenThousand',
  MILLION = 'million',
  HUNDREDMILLION = 'hundredMillion',
}

// 透视图样式
export interface PivotTableStyle {
  common: PivotStyleCommon;
  row: PivotStyleRow;
  column: PivotStyleColumn;
}

export interface PivotStyleCommon {
  combineStatus: CombineStatus;
  transposed: boolean;
  fontSize: number;
  color2CrossLine: string;
  openReplace: boolean;
  replaceTemplate?: string;
}

export type PivotStyleRow = KeyValueGeneric<TextColumnState>;

export type PivotStyleColumn = KeyValueGeneric<TextColumnState | NumbericColumnState>;

export interface TextColumnState {
  width?: number;
  label?: string;
  header: BasicAppearance;
  content: BasicAppearance;
}

export interface NumbericColumnState extends TextColumnState {
  dataformat: DataFormat;
}

export interface BasicAppearance {
  color: BaseValue<string>;
  textAlign: BaseValue<TextAlign>;
  background: BaseValue<string>;
}

export interface DataFormat {
  unit: DataUnitFormat;
  suffix: string | null;
  decimal: number;
  separator: boolean;
  decimalType: DecimalType;
}

export interface KeyValueGeneric<T> {
  [key: string]: T;
}

export interface BaseValue<T> {
  value: T;
  timestamp: number | null;
}
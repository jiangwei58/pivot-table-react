import { BasicAppearance, DataFormat, DataUnitFormat, NumbericColumnState, PivotStyleCommon, TextColumnState } from '../interface/style';

export const defaultPivotTitleBasicAppearance: BasicAppearance = {
  color: {
    value: '#000',
    timestamp: null,
  },
  textAlign: {
    value: 'left',
    timestamp: null,
  },
  background: {
    value: '#fff',
    timestamp: null,
  },
};

export const defaultPivotContentBasicAppearance: BasicAppearance = {
  color: {
    value: '#000',
    timestamp: null,
  },
  textAlign: {
    value: 'right',
    timestamp: null,
  },
  background: {
    value: '#fff',
    timestamp: null,
  },
};

export const defaultPivotCommonState: PivotStyleCommon = {
  combineStatus: 'combine',
  transposed: false,
  fontSize: 14,
  color2CrossLine: '#F5F5F5',
  openReplace: true,
  replaceTemplate: '-'
};

export const defaultPivotBasicDataFormat: DataFormat = {
  unit: DataUnitFormat.AUTO,
  suffix: null,
  decimal: 2,
  separator: true,
  decimalType: 'atmost',
};

export const defaultPivotTextColumn: TextColumnState = {
  header: {
    ...defaultPivotTitleBasicAppearance,
  },
  content: {
    ...defaultPivotContentBasicAppearance,
  },
};

export const defaultPivotNumbericColumn: NumbericColumnState = {
  ...defaultPivotTextColumn,
  dataformat: {
    ...defaultPivotBasicDataFormat,
  },
};
import {
  PivotRequestCell,
  PivotTreeCell,
  PivotStyleConfig,
  PivotXYObject,
  PivotHeaderCell,
  PivotDataObject,
  PivotSortProps,
  CellValue,
  FieldsTypeInterface,
  FieldsProps,
} from '../interface';
import { forEach, merge, reduce, cloneDeep, forIn, sumBy, clone, map, isUndefined, includes } from 'lodash';
import { defaultPivotTextColumn, defaultPivotCommonState, defaultPivotNumbericColumn } from '../contants/style';
import { BaseValue, TextAlign } from '../interface/style';
import { DEFAULT_CELL_WIDTH } from '../pivotConfig';
import { sortInTree } from './pivotSort';
import { BasicAppearance, NumbericColumnState, PivotTableStyle, TextColumnState } from '../interface/style';

/**
 * 通用处理递归树形数据
 * @param treeData - 树形数据
 * @param iterate - 在每一次迭代调用, 如返回false则结束迭代
 */
export const loopTree = <T extends { children?: T[] }>(treeData: T[], iterate: (item: T) => void | boolean) => {
  forEach(treeData, (item) => {
    if (iterate(item) === false) {
      return false;
    }
    if (item.children && item.children.length) {
      loopTree(item.children, iterate);
    }
  });
};

// 当前版本，暂时不做任何的区分：针对于文本类型、日期类型、数值类型返回出来的以上的无效值，均统称为无效值；
export const isInvalidValue = (value?: string | number | null): boolean => {
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value);
  }
  // text or date type
  return includes(['null', 'NULL', 'Null', 'undefined', 'NaN', 'Infinity', '-Infinity'], value + '');
};

export const isNumberic = (key: string | number, fieldsType?: FieldsTypeInterface) => {
  if (fieldsType) {
    const keyPath = (key + '').split('-');
    const indexNo = +keyPath[keyPath.length - 1];
    return fieldsType[indexNo] === 'number';
  }
  return false;
};

// 转换X或Y为map数据格式
export const convertXYToObject = (
  data: FieldsProps[],
  level = 0,
  pIndexNos: number[] = [],
  result: PivotXYObject = { length: 0, maxLevel: 1, maxDeepIndexNos: [] },
) => {
  forEach(data, (item) => {
    const indexNos = pIndexNos.concat(item.indexNo);
    result[item.indexNo] = {
      ...item,
      indexNos,
      children: undefined,
    };
    result.length++;
    if (item.children?.length) {
      convertXYToObject(item.children, level + 1, indexNos, result);
    }
    if (level + 1 > result.maxLevel) {
      result.maxLevel = level + 1;
      result.maxDeepIndexNos = indexNos;
    }
  });
  return result;
};

// 深度遍历树形数据转换为列表
export const convertTreeToList = (
  treeData: PivotRequestCell[],
  fieldsObject: PivotXYObject,
  {
    combineStatus = true,
    sort,
    data,
  }: {
    combineStatus?: boolean;
    sort?: PivotSortProps;
    data?: PivotDataObject;
  } = {},
): PivotTreeCell[] => {
  const levelOffset: number[][] = [];
  const result: PivotTreeCell[] = [];

  const loopFunc = (loopData: PivotRequestCell[], loopMaxLevel: number, level = 0, pIndexNos: number[] = [], pValues: CellValue[] = []) => {
    levelOffset[level] = levelOffset[level] || [];
    // 应用排序，指标排序直接取维度的叶子节点
    const sortIndexNos = sort && !isUndefined(sort.id) && level === loopMaxLevel - 1 ? sort.sortField : pIndexNos.concat(loopData[0].indexNo);
    const newLoopData = sortInTree(loopData, sortIndexNos, sort, data);

    forEach(newLoopData, (item) => {
      const indexNos = pIndexNos.concat(item.indexNo);
      const values = pValues.concat(item.value);
      const nodeItem: PivotTreeCell = {
        ...item,
        children: undefined,
        indexNos,
        values,
        level,
        isLeaf: !item.children?.length,
        spaceOffset: levelOffset[level].length,
        spaceSize: 1,
        spaceLevel: 1,
        offsetIndexNos: [...levelOffset[level]],
      };
      result.push(nodeItem);
      if (item.children?.length) {
        // 获取叶子节点数量作为占位大小和下一个节点的偏移量
        let tempSpaceSize = 0;
        nodeItem.leafIndexNos = [];
        loopTree(item.children, (childItem) => {
          if (!childItem.children?.length) {
            tempSpaceSize += 1;
            nodeItem.leafIndexNos?.push(childItem.indexNo);
          }
        });
        levelOffset[level] = levelOffset[level].concat(nodeItem.leafIndexNos);
        // 合并维度则当做占位大小，不合并则填充多个相同维度
        if (combineStatus) {
          nodeItem.spaceSize = tempSpaceSize;
        } else {
          forEach(new Array(tempSpaceSize - 1), (_tempItem, tempIndex) => {
            result.push({ ...nodeItem, spaceOffset: nodeItem.spaceOffset + tempIndex + 1 });
          });
        }

        loopFunc(item.children, loopMaxLevel, level + 1, indexNos, values);
      } else {
        // 不是最大层级的叶子节点补充大小
        nodeItem.spaceLevel = fieldsObject.maxLevel - level;
        forEach(new Array(nodeItem.spaceLevel), (_item, index) => {
          levelOffset[level + index] = levelOffset[level + index] || [];
          levelOffset[level + index].push(nodeItem.indexNo);
        });
      }
    });
  };
  loopFunc(treeData, fieldsObject.maxLevel);
  return result;
};

// 视图维度指标转换为表头列表
export const convertXYToHeaderList = (x: FieldsProps[], y: FieldsProps[], transposed: boolean) => {
  let result: PivotHeaderCell[] = [];

  const loopFunc = (data: FieldsProps[], type: 'row' | 'col', level = 0, pIndexNos: number[] = [], list: PivotHeaderCell[] = []) => {
    forEach(data, (item) => {
      const indexNos = pIndexNos.concat(item.indexNo);
      const nodeItem: PivotHeaderCell = {
        indexNo: item.indexNo,
        value: item.colName,
        children: undefined,
        indexNos,
        level,
        isLeaf: !item.children?.length,
        spaceOffset: type === 'row' ? indexNos.length - 1 : 0,
        spaceSize: type === 'row' ? 1 : 2,
        spaceLevel: 1,
      };
      list.push(nodeItem);
      if (item.children?.length) {
        loopFunc(item.children, type, type === 'row' ? level : level + 1, indexNos, list);
      }
    });
    return list;
  };

  if (!transposed) {
    let yList = loopFunc([y[0]], 'col');
    const maxYLevel = yList[yList.length - 1].level + 1;
    yList = yList.slice(0, maxYLevel - 1);
    const xList = loopFunc([x[0]], 'row', maxYLevel - 1);
    result = result.concat(yList, xList);
  } else {
    let xList = loopFunc([x[0]], 'col');
    const maxXLevel = xList[xList.length - 1].level + 1;
    xList = xList.slice(0, maxXLevel - 1);
    let yList = loopFunc([y[0]], 'row', maxXLevel - 1);
    const maxYLevel = yList[yList.length - 1].indexNos.length;
    yList = yList.filter((item) => item.indexNos.length !== maxYLevel);
    yList = map(new Array(maxYLevel), (_item, index) => {
      return yList[index]
        ? yList[index]
        : {
            ...yList[index - 1],
            spaceOffset: yList[index - 1].spaceOffset + 1,
            value: '',
          };
    });
    result = result.concat(xList, yList);
  }

  return result;
};

// 根据indexNo获取默认样式
export const getIndexNoDefaultStyle = (indexNo: number, fieldsType: FieldsTypeInterface) => {
  return isNumberic(indexNo, fieldsType) ? clone(defaultPivotNumbericColumn) : clone(defaultPivotTextColumn);
};

// 根据字段生成对应字段样式
export const getPivotStyles = (x: FieldsProps[], y: FieldsProps[], config: PivotTableStyle, fieldsType: FieldsTypeInterface) => {
  const styleConfigData: PivotStyleConfig['data'] = {};

  loopTree(x, (item) => {
    styleConfigData[item.indexNo] = merge({}, getIndexNoDefaultStyle(item.indexNo, fieldsType), config.row[item.indexNo]);
  });

  loopTree(y, (item) => {
    styleConfigData[item.indexNo] = merge({}, getIndexNoDefaultStyle(item.indexNo, fieldsType), config.column[item.indexNo]);
  });

  return {
    common: merge({}, defaultPivotCommonState, config.common),
    data: styleConfigData,
  } as PivotStyleConfig;
};

// 获取所有indexNo相关样式按时间搓优先取值
export const getPivotCellStyle = (indexNos: number[], styleConfig: PivotStyleConfig): TextColumnState | NumbericColumnState => {
  return reduce(
    indexNos,
    (result, indexNo) => {
      const item = styleConfig.data[indexNo];
      forIn(item.header, (value, key) => {
        const keys = key as keyof BasicAppearance;
        const oldTime = (result.header[keys] && result.header[keys].timestamp) || 0;
        const newTime = value.timestamp || 0;
        if (newTime >= oldTime) {
          result.header[keys] = value as BaseValue<string> & BaseValue<TextAlign>;
        }
      });

      forIn(item.content, (value, key) => {
        const keys = key as keyof BasicAppearance;
        const oldTime = (result.content[keys] && result.content[keys].timestamp) || 0;
        const newTime = value.timestamp || 0;
        if (newTime >= oldTime) {
          result.content[keys] = value as BaseValue<string> & BaseValue<TextAlign>;
        }
      });

      return result;
    },
    cloneDeep(styleConfig.data[indexNos[0]]),
  );
};

// 获取所有indexNo的宽度的总和
export const getIndexNosWidthTotal = (indexNos: number[], styleConfig: PivotStyleConfig) => {
  return sumBy(indexNos, (indexNo) => {
    return styleConfig.data[indexNo].width || DEFAULT_CELL_WIDTH;
  });
};

import { useMemo } from 'react';
import { convertXYToHeaderList, convertTreeToList, convertXYToObject } from '../utils/pivotUtil';
import {
  PivotStyleConfig,
  UsePivotData,
  PivotHeaderCell,
  PivotDataObject,
  PivotOptionType,
  PivotSortProps,
  FieldsProps,
} from '../interface';

interface OwnProps {
  x: FieldsProps[];
  y: FieldsProps[];
  styleConfig: PivotStyleConfig;
  option: PivotOptionType;
  sort?: PivotSortProps;
}

function usePivotData({ x, y, styleConfig, option, sort }: OwnProps): [UsePivotData] {
  const styleConfigCommon = useMemo(() => {
    return { ...styleConfig.common };
  }, [styleConfig]);

  const xyObject = useMemo(() => {
    const xObject = convertXYToObject(x);
    const yObject = convertXYToObject(y);

    return !styleConfigCommon.transposed
      ? {
          x: xObject,
          y: yObject,
        }
      : {
          x: yObject,
          y: xObject,
        };
  }, [x, y, styleConfigCommon.transposed]);

  const dataObject = useMemo<PivotDataObject>(() => {
    const { data } = option.pivotTable;
    return data;
  }, [option.pivotTable]);

  const headerList = useMemo<PivotHeaderCell[]>(() => {
    const transposed = styleConfigCommon.transposed;
    // console.log('headerList------', convertXYToHeaderList(x, y, transposed))
    return convertXYToHeaderList(x, y, transposed);
  }, [x, y, styleConfigCommon.transposed]);

  const topAndLeftTreeList = useMemo(() => {
    const transposed = styleConfigCommon.transposed;
    const combineStatus = styleConfigCommon.combineStatus === 'combine';
    const topTree = (!transposed ? option.pivotTable.topTree : option.pivotTable.leftTree) || [];
    const leftTree = (!transposed ? option.pivotTable.leftTree : option.pivotTable.topTree) || [];

    // console.log(
    //   'topAndLeftTreeList------',
    //   convertTreeToList(topTree, xyObject.y),
    //   convertTreeToList(leftTree, xyObject.x, { combineStatus, sort, data: dataObject }),
    // );
    return {
      topTreeList: convertTreeToList(topTree, xyObject.y),
      leftTreeList: convertTreeToList(leftTree, xyObject.x, { combineStatus, sort, data: dataObject }),
    };
  }, [
    option.pivotTable.topTree,
    option.pivotTable.leftTree,
    xyObject,
    styleConfigCommon.transposed,
    styleConfigCommon.combineStatus,
    sort,
    dataObject,
  ]);

  const dataResult: UsePivotData = {
    xObject: xyObject.x,
    yObject: xyObject.y,
    headerList,
    topTreeList: topAndLeftTreeList.topTreeList,
    leftTreeList: topAndLeftTreeList.leftTreeList,
    data: dataObject,
  };

  return [dataResult];
}

export default usePivotData;

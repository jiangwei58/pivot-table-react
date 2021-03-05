import React, { useMemo } from 'react';
import { Grid, GridCellProps, Index } from 'react-virtualized';
import { PivotTreeCell, CommonChildProps, PivotDataObject, FieldsTypeInterface } from './interface';
import { last, reduce, merge } from 'lodash';
import { DEFAULT_CELL_HEIGHT } from './pivotConfig';
import PivotTableCell from './PivotTableCell';
import { getPivotCellStyle, getIndexNosWidthTotal, isInvalidValue } from './utils/pivotUtil';
import { defaultPivotContentBasicAppearance } from './contants/style';

interface OwnProps extends CommonChildProps {
  offsetX: number;
  topTreeData: PivotTreeCell[];
  leftTreeData: PivotTreeCell[];
  fieldsType: FieldsTypeInterface;
  data: PivotDataObject;
}

const PivotTableList: React.FC<OwnProps> = (props) => {
  const gridRef = React.createRef<Grid>();

  const topTreeLeafData = useMemo(() => {
    return reduce(
      props.topTreeData,
      (result, item) => {
        if (typeof item.id !== 'undefined') {
          result[item.id] = item;
        }
        return result;
      },
      {} as { [id: string]: PivotTreeCell },
    );
  }, [props.topTreeData]);

  const leftTreeLeafData = useMemo(() => {
    let index = 0;
    return reduce(
      props.leftTreeData,
      (result, item) => {
        if (typeof item.id !== 'undefined') {
          result[index] = item;
          index++;
        }
        return result;
      },
      {} as { [id: string]: PivotTreeCell },
    );
  }, [props.leftTreeData]);

  const columnWidth = (params: Index) => {
    let columnIndex = params.index;
    if (props.offsetX) {
      if (columnIndex === 0) return props.offsetX;
      columnIndex -= 1;
    }
    const topListItem = topTreeLeafData[columnIndex];
    return getIndexNosWidthTotal([topListItem.indexNo], props.styleConfig);
  };

  const cellRenderer = (cellProps: GridCellProps) => {
    const { key, rowIndex } = cellProps;
    let columnIndex = cellProps.columnIndex;
    if (props.offsetX) {
      if (columnIndex === 0) return null;
      columnIndex -= 1;
    }

    const topListItem = topTreeLeafData[columnIndex];
    const leftListItem = leftTreeLeafData[rowIndex];

    const itemKey = !props.styleConfig.common.transposed ? `${leftListItem.id}-${topListItem.id}` : `${topListItem.id}-${leftListItem.id}`;
    let value = props.data[itemKey];
    // 如果不是合法值则按配置替换指定空值
    if (props.styleConfig.common.openReplace && isInvalidValue(value)) {
      value = props.styleConfig.common.replaceTemplate || '';
    }
    // 获取单元格样式（条件格式->字段样式配置->公共样式配置）
    let style: React.CSSProperties = {
      ...cellProps.style,
    };
    let icon: React.ReactNode | undefined;
    const styleCommon = props.styleConfig.common;
    const styleItem = getPivotCellStyle([...topListItem.indexNos, ...leftListItem.indexNos], props.styleConfig);
    const background =
      rowIndex % 2 === 0 && styleItem.content.background.value === defaultPivotContentBasicAppearance.background.value
        ? styleCommon.color2CrossLine
        : styleItem.content.background.value;
    style = merge(
      {},
      style,
      {
        fontSize: styleCommon.fontSize,
        color: styleItem.content.color.value,
        background,
        textAlign: styleItem.content.textAlign.value,
      },
    );

    return <PivotTableCell key={key} icon={icon} style={style} value={value} />;
  };

  return (
    <Grid
      {...props}
      ref={gridRef}
      className="pivot-right-content-grid"
      columnWidth={columnWidth}
      rowHeight={DEFAULT_CELL_HEIGHT}
      columnCount={(last(props.topTreeData)?.spaceOffset || 0) + 1 + (props.offsetX ? 1 : 0)}
      rowCount={(last(props.leftTreeData)?.spaceOffset || 0) + 1}
      cellRenderer={cellRenderer}
    />
  );
};

export default PivotTableList;

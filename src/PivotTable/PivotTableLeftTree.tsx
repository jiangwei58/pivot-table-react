import React, { useCallback } from 'react';
import { PivotTreeCell, CommonChildProps, PivotSortProps } from './interface';
import { CollectionCellRendererParams, Index, Collection } from 'react-virtualized';
import { DEFAULT_CELL_HEIGHT } from './pivotConfig';
import PivotTableCell from './PivotTableCell';
import { getPivotCellStyle, getIndexNosWidthTotal } from './utils/pivotUtil';

interface OwnProps extends CommonChildProps {
  data: PivotTreeCell[];
  maxDeepIndexNos: number[];
  sort?: PivotSortProps;
}

const PivotTableLeftTree: React.FC<OwnProps> = (props) => {
  const collectionRef = useCallback(
    (collection) => {
      if (props.sort) {
        collection?.recomputeCellSizesAndPositions();
      }
    },
    [props.sort],
  );

  const cellRenderer = (params: CollectionCellRendererParams) => {
    const item = props.data[params.index];

    const styleCommon = props.styleConfig.common;
    const styleItem = getPivotCellStyle(item.indexNos, props.styleConfig);
    const background =
      item.isLeaf && item.spaceOffset % 2 === 0 && styleItem.header.background.value === '#fff'
        ? styleCommon.color2CrossLine
        : styleItem.header.background.value;
    const style: React.CSSProperties = {
      ...params.style,
      fontSize: styleCommon.fontSize,
      color: styleItem.header.color.value,
      background,
      textAlign: styleItem.header.textAlign.value,
    };

    return (
      <PivotTableCell
        key={params.key}
        style={style}
        value={item.value}
        fold={true}
      />
    );
  };

  const cellSizeAndPositionGetter = (params: Index) => {
    const item = props.data[params.index];

    return {
      width: getIndexNosWidthTotal(item.isLeaf && item.spaceLevel > 1 ? props.maxDeepIndexNos.slice(item.level) : [item.indexNo], props.styleConfig),
      height: DEFAULT_CELL_HEIGHT * item.spaceSize,
      x: getIndexNosWidthTotal(item.indexNos.slice(0, item.level), props.styleConfig),
      y: DEFAULT_CELL_HEIGHT * item.spaceOffset,
    };
  };

  return (
    <Collection
      {...props}
      ref={collectionRef}
      className="pivot-left-content-collection"
      cellCount={props.data.length}
      cellRenderer={cellRenderer}
      cellSizeAndPositionGetter={cellSizeAndPositionGetter}
    />
  );
};

export default PivotTableLeftTree;

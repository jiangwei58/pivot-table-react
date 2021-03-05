import React, { useEffect } from 'react';
import { PivotTreeCell, CommonChildProps, PivotHeaderCell, PivotSortProps } from './interface';
import { CollectionCellRendererParams, Index, Collection } from 'react-virtualized';
import { DEFAULT_CELL_HEIGHT } from './pivotConfig';
import PivotTableCell from './PivotTableCell';
import { getPivotCellStyle, getIndexNosWidthTotal } from './utils/pivotUtil';

interface OwnProps extends CommonChildProps {
  offsetX: number;
  data: PivotTreeCell[];
  sort?: PivotSortProps;
  onSort: (item: PivotHeaderCell | PivotTreeCell) => void;
}

const PivotTableTopTree: React.FC<OwnProps> = (props) => {
  const collectionRef = React.createRef<Collection>();

  useEffect(() => {
    collectionRef.current?.recomputeCellSizesAndPositions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.offsetX]);

  const cellRenderer = (params: CollectionCellRendererParams) => {
    const item = props.data[params.index];

    const styleCommon = props.styleConfig.common;
    const styleItem = getPivotCellStyle(item.indexNos, props.styleConfig);
    const style: React.CSSProperties = {
      ...params.style,
      fontSize: styleCommon.fontSize,
      color: styleItem.header.color.value,
      background: styleItem.header.background.value,
      textAlign: styleItem.header.textAlign.value,
    };

    return (
      <PivotTableCell
        key={params.key}
        style={style}
        indexNo={item.indexNo}
        value={item.value}
        sortable={item.isLeaf}
        sort={props.sort && props.sort.id === item.id ? props.sort.sortOrder : undefined}
        onSort={props.onSort.bind(null, item)}
      />
    );
  };

  const cellSizeAndPositionGetter = (params: Index) => {
    const item = props.data[params.index];

    return {
      width: getIndexNosWidthTotal(item.leafIndexNos || [item.indexNo], props.styleConfig),
      height: DEFAULT_CELL_HEIGHT * item.spaceLevel,
      x: getIndexNosWidthTotal(item.offsetIndexNos || [], props.styleConfig) + props.offsetX,
      y: DEFAULT_CELL_HEIGHT * item.level,
    };
  };

  return (
    <Collection
      {...props}
      ref={collectionRef}
      className="pivot-right-header-collection"
      style={{ ...props.style, overflowX: 'hidden', overflowY: 'scroll' }}
      cellCount={props.data.length}
      cellRenderer={cellRenderer}
      cellSizeAndPositionGetter={cellSizeAndPositionGetter}
    />
  );
};

export default PivotTableTopTree;

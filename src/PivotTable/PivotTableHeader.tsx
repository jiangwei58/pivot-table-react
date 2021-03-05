import React, { useEffect } from 'react';
import { Collection, CollectionCellRendererParams, Index } from 'react-virtualized';
import { PivotTreeCell, CommonChildProps, PivotHeaderCell, PivotSortProps } from './interface';
import { DEFAULT_CELL_HEIGHT } from './pivotConfig';
import PivotTableCell from './PivotTableCell';
import { getPivotCellStyle, getIndexNosWidthTotal } from './utils/pivotUtil';
import { isEqual, includes } from 'lodash';

interface OwnProps extends CommonChildProps {
  data: PivotHeaderCell[];
  xMaxDeepIndexNos: number[];
  sort?: PivotSortProps;
  onSort: (item: PivotHeaderCell | PivotTreeCell) => void;
}

const PivotTableHeader: React.FC<OwnProps> = (props) => {
  const collectionRef = React.createRef<Collection>();

  useEffect(() => {
    collectionRef.current?.recomputeCellSizesAndPositions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.styleConfig.common.transposed]);

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
        sortable={includes(props.xMaxDeepIndexNos, item.indexNo)}
        sort={props.sort?.sortField && isEqual(item.indexNos, props.sort.sortField) ? props.sort.sortOrder : undefined}
        onSort={props.onSort.bind(null, item)}
      />
    );
  };

  const cellSizeAndPositionGetter = (params: Index) => {
    const item = props.data[params.index];

    return {
      width: getIndexNosWidthTotal(item.spaceSize > 1 ? props.xMaxDeepIndexNos : [item.indexNo], props.styleConfig),
      height: DEFAULT_CELL_HEIGHT * item.spaceLevel,
      x: getIndexNosWidthTotal(item.indexNos.slice(0, item.spaceOffset), props.styleConfig),
      y: DEFAULT_CELL_HEIGHT * item.level,
    };
  };

  return (
    <Collection
      {...props}
      ref={collectionRef}
      className="pivot-left-header-collection"
      cellCount={props.data.length}
      cellRenderer={cellRenderer}
      cellSizeAndPositionGetter={cellSizeAndPositionGetter}
    />
  );
};

export default PivotTableHeader;

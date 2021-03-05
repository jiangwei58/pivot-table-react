import React, { useMemo, useState } from 'react';
import './PivotTable.css';
import { SCROLL_WIDTH, defaultSort } from './pivotConfig';
import PivotTableHeader from './PivotTableHeader';
import PivotTableTopTree from './PivotTableTopTree';
import PivotTableLeftTree from './PivotTableLeftTree';
import PivotTableList from './PivotTableList';
import usePivotScroll from './hooks/usePivotScroll';
import usePivotData from './hooks/usePivotData';
import usePivotStyle from './hooks/usePivotStyle';
import usePivotLayout from './hooks/usePivotLayout';
import { isEqual } from 'lodash';
import { PivotTreeCell, PivotHeaderCell, PivotOptionType, SortOrder, PivotSortProps, ReportView } from './interface';
import { getNextOrder } from './utils/pivotSort';

interface PivotTableProps {
  width?: number;
  height?: number;
  options: ReportView;
  data: PivotOptionType;
  style?: React.CSSProperties;
}

const PivotTable: React.FC<PivotTableProps> = ({ options, data, ...props }) => {
  // 控制各模块的滚动
  const [scrollData] = usePivotScroll();

  // 缓存XY
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cacheX = useMemo(() => options.x, [data]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cacheY = useMemo(() => options.y, [data]);

  const [localSortData, setLocalSortData] = useState<PivotSortProps>();

  // 处理过的样式
  const [styleConfig] = usePivotStyle({
    x: cacheX,
    y: cacheY,
    config: options.styleConfig,
    fieldsType: data.fieldsType,
  });

  // 处理过的数据
  const [pivotData] = usePivotData({
    x: cacheX,
    y: cacheY,
    styleConfig,
    option: data,
    sort: localSortData,
  });

  // 布局
  const [layoutConfig] = usePivotLayout({
    layoutWidth: props.width || 0,
    layoutHeight: props.height || 0,
    xObject: pivotData.xObject,
    yObject: pivotData.yObject,
    styleConfig,
  });

  // 排序
  const handleSort = (item: PivotHeaderCell | PivotTreeCell) => {
    const localSort = localSortData ? localSortData : { ...defaultSort };
    const newOrder = getNextOrder(localSort.sortOrder, isEqual(item.indexNos, localSort.sortField));
    const newSort =
      newOrder === SortOrder.NO_ORDER
        ? {
            ...defaultSort,
          }
        : {
            sortField: item.indexNos,
            sortValue: [item.value],
            indicator: false,
            sortOrder: newOrder,
            id: (item as PivotTreeCell).id,
          };

    setLocalSortData(newSort);
  };

  return (
    <div className='pivot-table'>
      <div
        className={`pivot-left-panel ${layoutConfig.isSplitMode ? '' : 'pivot-left-panel-absolute'} ${
          scrollData.listScrollLeft ? 'pivot-shadow-right' : ''
        }`}
      >
        <div className={`pivot-left-header ${scrollData.contentScrollTop ? 'pivot-shadow-bottom' : ''}`}>
          <PivotTableHeader
            width={layoutConfig.leftWidth}
            height={layoutConfig.topHeight}
            styleConfig={styleConfig}
            xMaxDeepIndexNos={pivotData.xObject.maxDeepIndexNos}
            data={pivotData.headerList}
            scrollLeft={scrollData.leftTreeScrollLeft}
            sort={localSortData}
            onSort={handleSort}
          />
        </div>
        <div className='pivot-left-content'>
          <PivotTableLeftTree
            width={layoutConfig.leftWidth + SCROLL_WIDTH}
            height={layoutConfig.contentHeight - (layoutConfig.isSplitMode ? 0 : SCROLL_WIDTH)}
            styleConfig={styleConfig}
            maxDeepIndexNos={pivotData.xObject.maxDeepIndexNos}
            data={pivotData.leftTreeList}
            sort={localSortData}
            scrollTop={scrollData.contentScrollTop}
            scrollLeft={scrollData.leftTreeScrollLeft}
            onScroll={scrollData.onScroll.bind(null, 'left')}
          />
        </div>
      </div>
      <div className='pivot-right-panel'>
        <div className={`pivot-right-header ${scrollData.contentScrollTop ? 'pivot-shadow-bottom' : ''}`}>
          <PivotTableTopTree
            width={layoutConfig.rightWidth}
            height={layoutConfig.topHeight}
            offsetX={layoutConfig.rightPaddingWidth}
            styleConfig={styleConfig}
            data={pivotData.topTreeList}
            sort={localSortData}
            scrollLeft={scrollData.listScrollLeft}
            onSort={handleSort}
          />
        </div>
        <div className='pivot-right-content'>
          <PivotTableList
            width={layoutConfig.rightWidth}
            height={layoutConfig.contentHeight}
            offsetX={layoutConfig.rightPaddingWidth}
            styleConfig={styleConfig}
            topTreeData={pivotData.topTreeList}
            leftTreeData={pivotData.leftTreeList}
            fieldsType={data.fieldsType}
            data={pivotData.data}
            scrollTop={scrollData.contentScrollTop}
            scrollLeft={scrollData.listScrollLeft}
            onScroll={scrollData.onScroll.bind(null, 'right')}
          />
        </div>
      </div>
      <div className='pivot-border-top' />
      <div className='pivot-border-left' />
    </div>
  );
};

export default PivotTable;

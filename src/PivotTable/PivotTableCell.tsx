import React from 'react';
import { noop, isUndefined } from 'lodash';
import { CellValue, SortOrder } from './interface';

interface OwnProps {
  style: React.CSSProperties;
  icon?: React.ReactNode;
  indexNo?: number;
  value: CellValue;
  onClick?: (value: CellValue) => void;
  sortable?: boolean;
  sort?: SortOrder;
  onSort?: () => void;
  fold?: boolean;
  onChangefold?: (fold: boolean) => void;
}

const PivotTableCell: React.FC<OwnProps> = ({ onClick, onSort, fold, onChangefold = noop, ...props }) => {
  const handleClick = () => {
    const clickFn = onClick ? onClick : noop;
    clickFn(props.value);
  };

  const handleChangefold = () => {
    onChangefold(!fold);
  };

  const renderSort = () => {
    if (!props.sortable) return null;
    return (
      <div className="pivot-cell-sort" onClick={onSort}>
        <span className={`triangle-up ${props.sort === SortOrder.ASC ? 'sort-active' : ''}`} />
        <span className={`triangle-down ${props.sort === SortOrder.DESC ? 'sort-active' : ''}`} />
      </div>
    );
  };

  const renderFold = () => {
    if (isUndefined(fold)) return null;
    const className = 'pivot-cell-toggle margin-right-5';
    return fold ? (
      <span className={className} onClick={handleChangefold} />
    ) : (
      <span className={className} onClick={handleChangefold} />
    );
  };

  return (
    <div className="pivot-table-cell" style={props.style}>
      {renderFold()}
      <div className={`pivot-cell-value ${!!onClick ? 'pivot-cell-jump' : ''}`} onClick={handleClick}>
        {props.icon}
        {props.value}
      </div>
      {renderSort()}
    </div>
  );
};

export default PivotTableCell;

import { useMemo } from 'react';
import { PivotLayoutConfig, PivotStyleConfig, PivotXYObject } from '../interface';
import { LEFT_PANEL_MAX_SCALE, DEFAULT_CELL_HEIGHT } from '../pivotConfig';
import { getIndexNosWidthTotal } from '../utils/pivotUtil';

interface OwnProps {
  layoutWidth: number;
  layoutHeight: number;
  xObject: PivotXYObject;
  yObject: PivotXYObject;
  styleConfig: PivotStyleConfig;
}

function usePivotLayout(props: OwnProps): [PivotLayoutConfig] {
  const layoutConfig = useMemo<PivotLayoutConfig>(() => {
    const layoutWidth = props.layoutWidth || 0;
    const layoutHeight = props.layoutHeight || 0;
    const splitWidth = layoutWidth * LEFT_PANEL_MAX_SCALE;

    const topHeight = props.yObject.maxLevel * DEFAULT_CELL_HEIGHT;
    const leftWidth = getIndexNosWidthTotal(props.xObject.maxDeepIndexNos, props.styleConfig);

    const isSplitMode = leftWidth > splitWidth;

    const result: PivotLayoutConfig = {
      isSplitMode,
      topHeight,
      contentHeight: layoutHeight - topHeight,
      leftWidth,
      rightWidth: layoutWidth - leftWidth,
      rightPaddingWidth: 0,
    };

    if (isSplitMode) {
      result.leftWidth = splitWidth;
      result.rightWidth = layoutWidth - result.leftWidth;
    } else {
      result.rightWidth = layoutWidth;
      result.rightPaddingWidth = leftWidth;
    }

    return result;
  }, [props.layoutWidth, props.layoutHeight, props.xObject, props.yObject, props.styleConfig]);

  return [layoutConfig];
}

export default usePivotLayout;

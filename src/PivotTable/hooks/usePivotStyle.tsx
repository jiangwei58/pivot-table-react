import { useMemo } from 'react';
import { getPivotStyles } from '../utils/pivotUtil';
import { FieldsProps, FieldsTypeInterface, PivotStyleConfig } from '../interface';
import { PivotTableStyle } from '../interface/style';

interface OwnProps {
  x: FieldsProps[];
  y: FieldsProps[];
  config: PivotTableStyle;
  fieldsType: FieldsTypeInterface;
}

function usePivotStyle(props: OwnProps): [PivotStyleConfig] {
  const styleConfig = useMemo(() => {
    // console.log('styleConfig------', getPivotStyles(props.x, props.y, props.config, props.fieldsType))
    return getPivotStyles(props.x, props.y, props.config, props.fieldsType);
  }, [props.x, props.y, props.config, props.fieldsType]);

  return [styleConfig];
}

export default usePivotStyle;

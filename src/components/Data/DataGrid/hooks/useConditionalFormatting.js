import { useCallback, useMemo } from 'react';

const isNumeric = value => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(value) && !isNaN(parseFloat(value));
};

const compareValues = (a, b, type = 'string') => {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  switch (type) {
    case 'number':
      return parseFloat(a) - parseFloat(b);
    case 'date':
      return new Date(a) - new Date(b);
    default:
      return String(a).localeCompare(String(b));
  }
};

export const useConditionalFormatting = (rules = {}) => {
  const memoizedRules = useMemo(() => rules, [rules]);

  const evaluateNumericCondition = useCallback((value, condition) => {
    if (!isNumeric(value) || !isNumeric(condition.value)) return false;
    const numValue = parseFloat(value);
    const numCondition = parseFloat(condition.value);
    
    switch (condition.type) {
      case 'equals':
        return Math.abs(numValue - numCondition) < Number.EPSILON;
      case 'notEquals':
        return Math.abs(numValue - numCondition) >= Number.EPSILON;
      case 'greaterThan':
        return numValue > numCondition;
      case 'lessThan':
        return numValue < numCondition;
      case 'between':
        if (!isNumeric(condition.min) || !isNumeric(condition.max)) return false;
        return numValue >= parseFloat(condition.min) && numValue <= parseFloat(condition.max);
      default:
        return false;
    }
  }, []);

  const evaluateStringCondition = useCallback((value, condition) => {
    const strValue = String(value).toLowerCase();
    const strCondition = String(condition.value).toLowerCase();
    
    switch (condition.type) {
      case 'equals':
        return strValue === strCondition;
      case 'notEquals':
        return strValue !== strCondition;
      case 'contains':
        return strValue.includes(strCondition);
      case 'notContains':
        return !strValue.includes(strCondition);
      case 'startsWith':
        return strValue.startsWith(strCondition);
      case 'endsWith':
        return strValue.endsWith(strCondition);
      case 'blank':
        return !value || value.toString().trim() === '';
      case 'notBlank':
        return value && value.toString().trim() !== '';
      default:
        return false;
    }
  }, []);

  const evaluateCondition = useCallback((value, condition) => {
    if (!condition || typeof condition !== 'object') {
      console.error('Invalid condition object:', condition);
      return false;
    }

    try {
      switch (condition.type) {
        case 'equals':
        case 'notEquals':
        case 'greaterThan':
        case 'lessThan':
        case 'between':
          if (isNumeric(value)) {
            return evaluateNumericCondition(value, condition);
          }
          return evaluateStringCondition(value, condition);

        case 'contains':
        case 'notContains':
        case 'startsWith':
        case 'endsWith':
        case 'blank':
        case 'notBlank':
          return evaluateStringCondition(value, condition);

        case 'custom':
          if (typeof condition.evaluate === 'function') {
            return condition.evaluate(value);
          }
          console.warn('Custom condition missing evaluate function');
          return false;

        default:
          console.warn(`Unsupported condition type: ${condition.type}`);
          return false;
      }
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }, [evaluateNumericCondition, evaluateStringCondition]);

  const getCellStyle = useCallback((value, rowIndex, columnIndex) => {
    const columnRules = memoizedRules[columnIndex] || [];
    const style = {};

    for (const rule of columnRules) {
      try {
        if (evaluateCondition(value, rule.condition)) {
          Object.assign(style, {
            backgroundColor: rule.style.backgroundColor,
            color: rule.style.color,
            fontWeight: rule.style.fontWeight,
            fontStyle: rule.style.fontStyle,
            textDecoration: rule.style.textDecoration,
          });

          // Apply gradient if specified
          if (rule.style.gradient) {
            const { min, max, colors } = rule.style.gradient;
            const normalizedValue = (Number(value) - min) / (max - min);
            const gradientColor = getGradientColor(normalizedValue, colors);
            style.backgroundColor = gradientColor;
          }

          // Apply icon if specified
          if (rule.style.icon) {
            style.icon = rule.style.icon;
          }

          // First matching rule wins unless override is specified
          if (!rule.continueMatching) {
            break;
          }
        }
      } catch (error) {
        console.error('Error applying formatting rule:', error);
      }
    }

    return style;
  }, [memoizedRules, evaluateCondition]);

  const getGradientColor = (normalizedValue, colors) => {
    if (normalizedValue <= 0) return colors[0];
    if (normalizedValue >= 1) return colors[colors.length - 1];

    const segment = 1 / (colors.length - 1);
    const index = Math.floor(normalizedValue / segment);
    const remainder = (normalizedValue - index * segment) / segment;

    const color1 = hexToRgb(colors[index]);
    const color2 = hexToRgb(colors[index + 1]);

    const r = Math.round(color1.r + (color2.r - color1.r) * remainder);
    const g = Math.round(color1.g + (color2.g - color1.g) * remainder);
    const b = Math.round(color1.b + (color2.b - color1.b) * remainder);

    return `rgb(${r},${g},${b})`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return {
    getCellStyle,
    evaluateCondition,
  };
};

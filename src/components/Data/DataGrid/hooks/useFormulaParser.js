import { useMemo, useCallback } from 'react';
import { Parser } from 'hot-formula-parser';

const MAX_FORMULA_LENGTH = 1000;
const FORMULA_PREFIX = '=';

const isValidFormula = (formula) => {
  if (!formula || typeof formula !== 'string') return false;
  if (formula.length > MAX_FORMULA_LENGTH) return false;
  return formula.startsWith(FORMULA_PREFIX);
};

export const useFormulaParser = (config = {}) => {
  // Memoize parser instance
  const parser = useMemo(() => {
    const p = new Parser();

    try {
      // Register custom functions
      const customFunctions = config.customFunctions || {};
      Object.entries(customFunctions).forEach(([name, func]) => {
        if (typeof func === 'function') {
          p.setFunction(name, (...args) => {
            try {
              return func(...args);
            } catch (error) {
              console.error(`Error in custom function ${name}:`, error);
              return '#ERROR!';
            }
          });
        } else {
          console.warn(`Invalid custom function: ${name}`);
        }
      });

      // Register variables
      const variables = config.variables || {};
      Object.entries(variables).forEach(([name, value]) => {
        p.setVariable(name, value);
      });

      // Register error handler
      p.on('error', (error) => {
        console.error('Formula parser error:', error);
      });

    } catch (error) {
      console.error('Error initializing formula parser:', error);
    }

    return p;
  }, [config]);

  const evaluateFormula = useCallback((formula, context = {}) => {
    if (!isValidFormula(formula)) return formula;
    
    try {
      // Set context variables
      Object.entries(context).forEach(([name, value]) => {
        parser.setVariable(name, value);
      });

      const result = parser.parse(formula.substring(1));
      
      if (result.error) {
        console.warn('Formula evaluation error:', result.error);
        return '#ERROR!';
      }

      // Format the result based on type
      if (typeof result.result === 'number') {
        // Handle precision and scientific notation
        if (Math.abs(result.result) < 0.0001 || Math.abs(result.result) > 10000000) {
          return result.result.toExponential(4);
        }
        return Number(result.result.toFixed(10)).toString();
      }

      return result.result;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
    } finally {
      // Clean up context variables
      Object.keys(context).forEach(name => {
        parser.setVariable(name, null);
      });
    }
  }, [parser]);

  const isFormulaCell = useCallback((value) => {
    return isValidFormula(value);
  }, []);

  const getCellReference = useCallback((col, row) => {
    try {
      if (col < 0 || row < 0) {
        throw new Error('Invalid cell reference');
      }
      const colLetter = String.fromCharCode(65 + col); // A, B, C, ...
      return `${colLetter}${row + 1}`;
    } catch (error) {
      console.error('Error generating cell reference:', error);
      return '#REF!';
    }
  }, []);

  const parseCellReference = useCallback((reference) => {
    try {
      if (typeof reference !== 'string') {
        throw new Error('Invalid reference type');
      }

      const match = reference.match(/([A-Z]+)(\d+)/);
      if (!match) {
        throw new Error('Invalid reference format');
      }

      const col = match[1].split('').reduce((acc, char) => {
        return acc * 26 + (char.charCodeAt(0) - 64);
      }, 0) - 1;

      const row = parseInt(match[2], 10) - 1;

      if (col < 0 || row < 0) {
        throw new Error('Invalid cell coordinates');
      }

      return { col, row };
    } catch (error) {
      console.error('Error parsing cell reference:', error);
      return null;
    }
  }, []);

  const validateFormula = useCallback((formula) => {
    if (!isValidFormula(formula)) {
      return { isValid: false, error: 'Invalid formula format' };
    }

    try {
      const result = parser.parse(formula.substring(1));
      return {
        isValid: !result.error,
        error: result.error ? String(result.error) : null,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message || 'Formula validation error',
      };
    }
  }, [parser]);

  return {
    evaluateFormula,
    isFormulaCell,
    getCellReference,
    parseCellReference,
    validateFormula,
    parser,
  };
};

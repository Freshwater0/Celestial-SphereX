// Basic arithmetic operations
const operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => b !== 0 ? a / b : '#DIV/0!',
  '^': (a, b) => Math.pow(a, b)
};

// Basic functions
const functions = {
  SUM: (args) => args.reduce((sum, val) => sum + (Number(val) || 0), 0),
  AVERAGE: (args) => {
    const sum = functions.SUM(args);
    return args.length > 0 ? sum / args.length : 0;
  },
  MAX: (args) => Math.max(...args.map(v => Number(v) || 0)),
  MIN: (args) => Math.min(...args.map(v => Number(v) || 0)),
  COUNT: (args) => args.filter(v => v !== null && v !== undefined && v !== '').length,
  IF: (args) => {
    if (args.length !== 3) return '#ERROR!';
    return args[0] ? args[1] : args[2];
  }
};

// Convert cell reference to row and column indices (e.g., 'A1' -> {row: 0, col: 0})
export const cellRefToIndices = (ref) => {
  const match = ref.match(/([A-Z]+)(\d+)/);
  if (!match) return null;
  
  const col = match[1].split('').reduce((acc, char) => 
    acc * 26 + char.charCodeAt(0) - 'A'.charCodeAt(0), 0);
  const row = parseInt(match[2]) - 1;
  
  return { row, col };
};

// Convert indices to cell reference (e.g., {row: 0, col: 0} -> 'A1')
export const indicesToCellRef = (row, col) => {
  let colRef = '';
  let n = col;
  while (n >= 0) {
    colRef = String.fromCharCode('A'.charCodeAt(0) + (n % 26)) + colRef;
    n = Math.floor(n / 26) - 1;
  }
  return `${colRef}${row + 1}`;
};

// Get cell value from reference
const getCellValue = (ref, data, columns) => {
  const indices = cellRefToIndices(ref);
  if (!indices) return null;
  
  const row = data[indices.row];
  if (!row) return null;
  
  const column = columns[indices.col];
  if (!column) return null;
  
  return row[column.key];
};

// Parse and evaluate formula
export const evaluateFormula = (formula, data, columns) => {
  try {
    if (!formula.startsWith('=')) return formula;
    
    const expression = formula.substring(1);
    
    // Handle cell references
    const withReferences = expression.replace(/[A-Z]+\d+/g, (ref) => {
      const value = getCellValue(ref, data, columns);
      return value === null ? '#REF!' : value;
    });
    
    // Handle functions
    const withFunctions = withReferences.replace(/([A-Z]+)\((.*?)\)/g, (match, func, args) => {
      if (!functions[func]) return '#NAME?';
      
      const evaluatedArgs = args.split(',').map(arg => {
        const trimmed = arg.trim();
        return isNaN(trimmed) ? trimmed : Number(trimmed);
      });
      
      return functions[func](evaluatedArgs);
    });
    
    // Evaluate arithmetic
    const result = eval(withFunctions); // Note: eval is used for simplicity, in production you'd want a proper parser
    return isNaN(result) ? '#ERROR!' : result;
  } catch (error) {
    return '#ERROR!';
  }
};

// Format number based on type
export const formatValue = (value, format) => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'number') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    case 'percentage':
      return new Intl.NumberFormat('en-US', { 
        style: 'percent',
        minimumFractionDigits: 2
      }).format(value / 100);
    case 'number':
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    default:
      return value.toString();
  }
};

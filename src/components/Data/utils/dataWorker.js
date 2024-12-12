/**
 * Web Worker for data processing
 * Handles CPU-intensive tasks off the main thread
 */

// Import required functions
importScripts('https://cdnjs.cloudflare.com/ajax/libs/mathjs/9.4.4/math.js');

// Message handler
self.onmessage = function(e) {
  const { type, data } = e.data;

  try {
    let result;
    switch (type) {
      case 'sort':
        result = sortData(data.items, data.config);
        break;
      case 'filter':
        result = filterData(data.items, data.config);
        break;
      case 'aggregate':
        result = aggregateData(data.items, data.config);
        break;
      case 'compute':
        result = computeFormulas(data.items, data.formulas);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

/**
 * Sort data based on multiple criteria
 * @param {Array} items - Data items to sort
 * @param {Object} config - Sort configuration
 * @returns {Array} Sorted items
 */
function sortData(items, config) {
  return items.slice().sort((a, b) => {
    for (const sort of config.sorts) {
      const { field, direction } = sort;
      const valueA = a[field];
      const valueB = b[field];
      
      if (valueA === valueB) continue;
      
      const modifier = direction === 'asc' ? 1 : -1;
      if (typeof valueA === 'string') {
        return valueA.localeCompare(valueB) * modifier;
      }
      return (valueA - valueB) * modifier;
    }
    return 0;
  });
}

/**
 * Filter data based on multiple criteria
 * @param {Array} items - Data items to filter
 * @param {Object} config - Filter configuration
 * @returns {Array} Filtered items
 */
function filterData(items, config) {
  return items.filter(item => {
    for (const filter of config.filters) {
      const { field, operator, value } = filter;
      const itemValue = item[field];

      switch (operator) {
        case 'equals':
          if (itemValue !== value) return false;
          break;
        case 'contains':
          if (!String(itemValue).includes(value)) return false;
          break;
        case 'greaterThan':
          if (!(itemValue > value)) return false;
          break;
        case 'lessThan':
          if (!(itemValue < value)) return false;
          break;
        case 'between':
          if (!(itemValue >= value[0] && itemValue <= value[1])) return false;
          break;
        case 'in':
          if (!value.includes(itemValue)) return false;
          break;
      }
    }
    return true;
  });
}

/**
 * Aggregate data using various functions
 * @param {Array} items - Data items to aggregate
 * @param {Object} config - Aggregation configuration
 * @returns {Object} Aggregation results
 */
function aggregateData(items, config) {
  const results = {};
  
  for (const agg of config.aggregations) {
    const { field, function: func } = agg;
    const values = items.map(item => item[field]).filter(v => v != null);

    switch (func) {
      case 'sum':
        results[field] = values.reduce((a, b) => a + b, 0);
        break;
      case 'average':
        results[field] = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'min':
        results[field] = Math.min(...values);
        break;
      case 'max':
        results[field] = Math.max(...values);
        break;
      case 'count':
        results[field] = values.length;
        break;
    }
  }

  return results;
}

/**
 * Compute formula results for cells
 * @param {Array} items - Data items
 * @param {Object} formulas - Formula definitions
 * @returns {Object} Computed results
 */
function computeFormulas(items, formulas) {
  const results = {};
  const parser = math.parser();

  // Register custom functions
  parser.set('AVERAGE', function(...args) {
    return args.reduce((a, b) => a + b, 0) / args.length;
  });

  parser.set('SUM', function(...args) {
    return args.reduce((a, b) => a + b, 0);
  });

  // Compute each formula
  for (const [key, formula] of Object.entries(formulas)) {
    try {
      // Set variables from items
      items.forEach((item, index) => {
        Object.entries(item).forEach(([field, value]) => {
          parser.set(`${field}${index}`, value);
        });
      });

      results[key] = parser.evaluate(formula);
    } catch (error) {
      results[key] = '#ERROR!';
    }
  }

  return results;
}

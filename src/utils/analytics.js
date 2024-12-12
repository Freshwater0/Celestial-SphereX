import { mean, std, median, max, min, sum } from 'mathjs';

// Statistical Analysis Functions
export const calculateBasicStats = (data, field) => {
  const values = data.map(item => item[field]).filter(val => !isNaN(val));
  return {
    mean: mean(values),
    median: median(values),
    stdDev: std(values),
    max: max(values),
    min: min(values),
    sum: sum(values)
  };
};

export const calculateGrowthRate = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

export const detectAnomalies = (data, field, threshold = 2) => {
  const values = data.map(item => item[field]);
  const stats = calculateBasicStats(data, field);
  const anomalyThreshold = stats.stdDev * threshold;
  
  return data.filter(item => 
    Math.abs(item[field] - stats.mean) > anomalyThreshold
  );
};

export const calculateMovingAverage = (data, field, period = 7) => {
  const values = data.map(item => item[field]);
  return values.map((_, index) => {
    if (index < period - 1) return null;
    const slice = values.slice(index - period + 1, index + 1);
    return mean(slice);
  });
};

export const calculateCorrelation = (data, field1, field2) => {
  const values1 = data.map(item => item[field1]);
  const values2 = data.map(item => item[field2]);
  
  const mean1 = mean(values1);
  const mean2 = mean(values2);
  
  const diffProd = values1.map((val, i) => 
    (val - mean1) * (values2[i] - mean2)
  );
  
  const sqDiff1 = values1.map(val => Math.pow(val - mean1, 2));
  const sqDiff2 = values2.map(val => Math.pow(val - mean2, 2));
  
  return sum(diffProd) / Math.sqrt(sum(sqDiff1) * sum(sqDiff2));
};

// Rule-Based Insights
export const checkThresholdViolation = (value, rules) => {
  const violations = [];
  
  if (rules.max && value > rules.max) {
    violations.push({
      type: 'exceeded_max',
      threshold: rules.max,
      value: value,
      message: `Value ${value} exceeded maximum threshold of ${rules.max}`
    });
  }
  
  if (rules.min && value < rules.min) {
    violations.push({
      type: 'below_min',
      threshold: rules.min,
      value: value,
      message: `Value ${value} fell below minimum threshold of ${rules.min}`
    });
  }
  
  if (rules.growthRate) {
    const growthRate = calculateGrowthRate(value, rules.previousValue);
    if (Math.abs(growthRate) > rules.growthRate) {
      violations.push({
        type: 'growth_rate',
        threshold: rules.growthRate,
        value: growthRate,
        message: `Growth rate of ${growthRate.toFixed(2)}% exceeded threshold of ${rules.growthRate}%`
      });
    }
  }
  
  return violations;
};

// Trend Analysis
export const analyzeTrends = (data, field) => {
  const values = data.map(item => item[field]);
  const movingAvg = calculateMovingAverage(data, field);
  const growthRates = values.map((val, i) => 
    i === 0 ? 0 : calculateGrowthRate(val, values[i-1])
  );
  
  const stats = calculateBasicStats(data, field);
  const trend = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  
  return {
    trend: trend > 0 ? 'upward' : trend < 0 ? 'downward' : 'stable',
    volatility: stats.stdDev / stats.mean, // coefficient of variation
    momentum: growthRates.slice(-3).reduce((sum, rate) => sum + rate, 0) / 3,
    support: stats.min,
    resistance: stats.max
  };
};

// Custom Formula Evaluation
export const evaluateCustomFormula = (formula, data) => {
  try {
    // Replace field references with actual values
    const evalFormula = formula.replace(/\{([^}]+)\}/g, (match, field) => {
      return data[field] || 0;
    });
    
    // Use mathjs evaluate for safe formula execution
    return {
      result: mean(evalFormula),
      error: null
    };
  } catch (error) {
    return {
      result: null,
      error: `Formula evaluation error: ${error.message}`
    };
  }
};

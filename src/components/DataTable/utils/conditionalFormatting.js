// Predefined color scales
export const colorScales = {
  redYellowGreen: ['#ff0000', '#ffff00', '#00ff00'],
  blueWhiteRed: ['#0000ff', '#ffffff', '#ff0000'],
  whiteRed: ['#ffffff', '#ff0000'],
  whiteGreen: ['#ffffff', '#00ff00']
};

// Predefined icon sets
export const iconSets = {
  arrows: ['↓', '→', '↑'],
  triangles: ['▼', '►', '▲'],
  circles: ['○', '◐', '●']
};

// Helper function to interpolate colors
const interpolateColor = (color1, color2, factor) => {
  const result = color1.match(/\w\w/g).map((c, i) => {
    const start = parseInt(c, 16);
    const end = parseInt(color2.match(/\w\w/g)[i], 16);
    const interpolated = Math.round(start + (end - start) * factor);
    return interpolated.toString(16).padStart(2, '0');
  });
  return `#${result.join('')}`;
};

// Get color for value based on color scale
export const getColorFromScale = (value, min, max, scale) => {
  if (value <= min) return scale[0];
  if (value >= max) return scale[scale.length - 1];
  
  const range = max - min;
  const normalizedValue = (value - min) / range;
  const segment = normalizedValue * (scale.length - 1);
  const index = Math.floor(segment);
  
  return interpolateColor(
    scale[index],
    scale[index + 1],
    segment - index
  );
};

// Apply conditional format based on rules
export const applyConditionalFormat = (value, rules) => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'colorScale':
        return {
          backgroundColor: getColorFromScale(
            value,
            rule.min,
            rule.max,
            colorScales[rule.scale] || colorScales.redYellowGreen
          )
        };
        
      case 'iconSet':
        const icons = iconSets[rule.set] || iconSets.arrows;
        const threshold = 100 / icons.length;
        const index = Math.floor(value / threshold);
        return {
          '&::after': {
            content: `"${icons[Math.min(index, icons.length - 1)]}"`,
            marginLeft: '4px'
          }
        };
        
      case 'dataBar':
        const percentage = Math.min(100, Math.max(0, 
          ((value - rule.min) / (rule.max - rule.min)) * 100
        ));
        return {
          background: `linear-gradient(90deg, 
            ${rule.color || '#0073e6'} ${percentage}%, 
            transparent ${percentage}%
          )`
        };
        
      case 'custom':
        if (rule.condition(value)) {
          return rule.style;
        }
        break;
    }
  }
  
  return {};
};

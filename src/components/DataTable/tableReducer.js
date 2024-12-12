export const tableReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SORT':
      return { 
        ...state, 
        orderBy: action.payload.property, 
        order: state.order === 'asc' ? 'desc' : 'asc' 
      };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_ROWS_PER_PAGE':
      return { 
        ...state, 
        rowsPerPage: action.payload, 
        page: 0 
      };
    case 'SET_SEARCH':
      return { 
        ...state, 
        searchTerm: action.payload, 
        page: 0 
      };
    case 'SET_FILTER':
      return { 
        ...state, 
        filterTerm: action.payload, 
        page: 0 
      };
    case 'UPDATE_CELL':
      const updatedData = [...state.tableData];
      let newValue = action.payload.value;
      
      if (typeof newValue === 'string' && newValue.startsWith('=')) {
        try {
          // Formula handling logic here
          newValue = action.payload.value; // Placeholder
        } catch (error) {
          console.error('Error evaluating formula:', error);
        }
      }
      
      if (updatedData[action.payload.index]) {
        updatedData[action.payload.index][action.payload.field] = newValue;
      }
      
      return { ...state, tableData: updatedData };
    case 'TOGGLE_MODAL':
      return { ...state, isModalOpen: action.payload };
    case 'TOGGLE_CHART_MODAL':
      return { ...state, isChartModalOpen: action.payload };
    case 'TOGGLE_PIVOT_MODAL':
      return { ...state, isPivotModalOpen: action.payload };
    case 'ADD_FORMATTING_RULE':
      return { 
        ...state, 
        formattingRules: [...state.formattingRules, action.payload] 
      };
    default:
      return state;
  }
};

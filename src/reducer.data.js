const INITIAL_STATE = {
  // text: "",
  result: null,
  searchResult: null,
  status: "",
};

const applyData = (state, action) => ({
  ...state,
  // text: action.text,
  result: null,
  status: "fetching"
});

const applyDataDone = (state, action) => ({
  ...state,
  result: action.result,
  status: "done"
});

const applySearch = (state, action) => ({
  ...state,
  // result: null,
  searchResult: null,
  status: "searching"
});

const applyClearSearch = (state, action) => ({
  ...state,
  // result: null,
  searchResult: null,
  status: "done"
});

const applySearchDone = (state, action) => ({
  ...state,
  searchResult: state.status !== 'done' ? action.result : null,
  status: state.status !== 'done' ? "searchdone" : "done"
});

export function dataReducer(state = INITIAL_STATE, action) {
  console.log(action.type)
  switch (action.type) {
    case 'DO_FETCH': {
      return applyData(state, action);
    }
    case 'DONE_FETCH': {
      return applyDataDone(state, action);
    }
    case 'DO_SEARCH': {
      return applySearch(state, action);
    }
    case 'CLEAR_SEARCH': {
      return applyClearSearch(state, action);
    }
    case 'DONE_SEARCH': {
      return applySearchDone(state, action);
    }
    default:
      return state;
  }
}
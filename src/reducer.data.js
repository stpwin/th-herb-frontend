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
  switch (action.type) {
    case 'DO_FETCH': {
      console.log(action.type)
      return applyData(state, action);
    }
    case 'DONE_FETCH': {
      console.log(action.type)
      return applyDataDone(state, action);
    }
    case 'DO_SEARCH': {
      console.log(action.type)
      return applySearch(state, action);
    }
    case 'CLEAR_SEARCH': {
      console.log(action.type)
      return applyClearSearch(state, action);
    }
    case 'DONE_SEARCH': {
      console.log(action.type)
      return applySearchDone(state, action);
    }
    default:
      return state;
  }
}
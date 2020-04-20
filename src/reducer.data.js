const INITIAL_STATE = {
  // text: "",
  result: null,
  herbalResult: [],
  diseaseResult: [],
  status: "fetching",
};

const applyData = (state, action) => ({
  ...state,
  // text: action.text,
  result: null,
  status: "fetching"
});

const applyFetchMore = (state, action) => ({
  ...state,
  // text: action.text,
  result: null,
  status: "more-fetching"
});

const applyDataDone = (state, action) => ({
  ...state,
  result: action.result,
  status: "done"
});

const applySearch = (state, action) => ({
  ...state,
  // result: null,
  herbalResult: [],
  diseaseResult: [],
  status: "searching"
});

const applyClearSearch = (state, action) => ({
  ...state,
  // result: null,
  herbalResult: [],
  diseaseResult: [],
  status: "done"
});

const applySearchDone = (state, action) => ({
  ...state,
  herbalResult: state.status !== 'done' ? action.herbalResult : [],
  diseaseResult: state.status !== 'done' ? action.diseaseResult : [],
  status: state.status !== 'done' ? "searchdone" : "done"
});

export function dataReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'DO_FETCH': {
      console.log(action.type)
      return applyData(state, action);
    }
    case 'DO_FETCH_MORE': {
      console.log(action.type)
      return applyFetchMore(state, action);
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
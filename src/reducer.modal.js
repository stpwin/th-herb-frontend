const INITIAL_STATE = {
  showFullView: false,
  showDisease: false,
  showHerbal: false,
  showRecipe: false,
  title: "",
  body: "",
  herbals: [],
  herbalsStatus: "fetching"
};

const applyShowFullView = (state, action) => ({
  ...state,
  title: action.title,
  body: action.body,
  showFullView: true
});

const applyHideFullView = (state, action) => ({
  ...state,
  showFullView: false
});

const applyHerbalsFetch = (state, action) => ({
  ...state,
  herbals: [],
  herbalsStatus: "fetching"
});

const applyHerbals = (state, action) => ({
  ...state,
  herbals: action.herbals,
  herbalsStatus: "done"
});

const applyShowDisease = (state, action) => ({
  ...state,
  showDisease: true
});

const applyHideDisease = (state, action) => ({
  ...state,
  showDisease: false
});

const applyShowHerbal = (state, action) => ({
  ...state,
  showHerbal: true
});

const applyHideHerbal = (state, action) => ({
  ...state,
  showHerbal: false
});

const applyShowRecipe = (state, action) => ({
  ...state,
  showRecipe: true
});

const applyHideRecipe = (state, action) => ({
  ...state,
  showRecipe: false
});

export function modalReducer(state = INITIAL_STATE, action) {
  console.log(action.type)
  switch (action.type) {
    case 'SHOW_FULLVIEW': {
      return applyShowFullView(state, action);
    }
    case 'HIDE_FULLVIEW': {
      return applyHideFullView(state, action);
    }
    case 'FULLVIEW_HERBAL_FETCH': {
      return applyHerbalsFetch(state, action);
    }
    case 'FULLVIEW_HERBAL': {
      return applyHerbals(state, action);
    }
    case 'SHOW_DISEASE': {
      return applyShowDisease(state, action);
    }
    case 'HIDE_DISEASE': {
      return applyHideDisease(state, action);
    }
    case 'SHOW_HERBAL': {
      return applyShowHerbal(state, action);
    }
    case 'HIDE_HERBAL': {
      return applyHideHerbal(state, action);
    }
    case 'SHOW_RECIPE': {
      return applyShowRecipe(state, action);
    }
    case 'HIDE_RECIPE': {
      return applyHideRecipe(state, action);
    }
    default:
      return state;
  }
}
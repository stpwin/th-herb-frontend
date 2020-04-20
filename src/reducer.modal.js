const INITIAL_STATE = {
  showFullView: false,
  showDisease: false,
  showHerbal: false,
  showRecipe: false,
  herbalView: false,
  title: "",
  body: "",
  herbals: [],
  recipe: "",
  herbalsStatus: "fetching",
  recipeStatus: "fetching",
};

const applyShowFullView = (state, action) => ({
  ...state,
  title: action.title,
  body: action.body,
  showFullView: true,
  herbalView: action.herbalView
});

const applyHideFullView = (state, action) => ({
  ...state,
  title: "",
  body: "",
  herbals: [],
  recipe: "",
  herbalsStatus: "fetching",
  recipeStatus: "fetching",
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



const applyRecipeFetch = (state, action) => ({
  ...state,
  recipe: null,
  recipeStatus: "fetching"
});

const applyRecipe = (state, action) => ({
  ...state,
  recipe: action.recipe,
  recipeStatus: "done"
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

  switch (action.type) {
    case 'SHOW_FULLVIEW': {
      console.log(action.type)
      return applyShowFullView(state, action);
    }
    case 'HIDE_FULLVIEW': {
      console.log(action.type)
      return applyHideFullView(state, action);
    }
    case 'FULLVIEW_HERBAL_FETCH': {
      console.log(action.type)
      return applyHerbalsFetch(state, action);
    }
    case 'FULLVIEW_HERBAL': {
      console.log(action.type)
      return applyHerbals(state, action);
    }


    case 'FULLVIEW_RECIPE_FETCH': {
      console.log(action.type)
      return applyRecipeFetch(state, action);
    }
    case 'FULLVIEW_RECIPE': {
      console.log(action.type)
      return applyRecipe(state, action);
    }



    case 'SHOW_DISEASE': {
      console.log(action.type)
      return applyShowDisease(state, action);
    }
    case 'HIDE_DISEASE': {
      console.log(action.type)
      return applyHideDisease(state, action);
    }
    case 'SHOW_HERBAL': {
      console.log(action.type)
      return applyShowHerbal(state, action);
    }
    case 'HIDE_HERBAL': {
      console.log(action.type)
      return applyHideHerbal(state, action);
    }
    case 'SHOW_RECIPE': {
      console.log(action.type)
      return applyShowRecipe(state, action);
    }
    case 'HIDE_RECIPE': {
      console.log(action.type)
      return applyHideRecipe(state, action);
    }
    default:
      return state;
  }
}
const INITIAL_STATE = {
  show: false,
  title: "",
  body: ""
};

const applyShow = (state, action) => ({
  ...state,
  title: action.title,
  body: action.body,
  show: true
});

const applyHide = (state, action) => ({
  ...state,
  show: false
});

export function fullviewReducer(state = INITIAL_STATE, action) {
  console.log(action.type)
  switch (action.type) {
    case 'SHOW_FULLVIEW': {
      return applyShow(state, action);
    }
    case 'HIDE_FULLVIEW': {
      return applyHide(state, action);
    }
    default:
      return state;
  }
}
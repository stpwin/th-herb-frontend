const INITIAL_STATE = {
  show: false,
  loggedIn: false,
  authUser: null
};

const showLogin = (state, action) => ({
  ...state,
  show: true
});

const hideLogin = (state, action) => ({
  ...state,
  show: false
});

const applySetAuthUser = (state, action) => ({
  ...state,
  authUser: action.authUser,
  show: action.authUser ? false : state.show
});

export function loginReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SHOW_LOGIN': {
      return showLogin(state, action);
    }
    case 'HIDE_LOGIN': {
      return hideLogin(state, action);
    }
    case 'SET_AUTH_USER': {
      return applySetAuthUser(state, action);
    }
    default:
      return state;
  }
}
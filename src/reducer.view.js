const INITIAL_STATE = {
    isShowTagView: false,
    tagName: ""
};

const showTagView = (state, action) => ({
    ...state,
    isShowTagView: true,
    tagName: action.tagName
})

const hideTagView = (state, action) => ({
    ...state,
    isShowTagView: false,
    tagName: ""
})

export function viewReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'SHOW_TAG_VIEW': {
            console.log(action.type)
            return showTagView(state, action);
        }
        case 'HIDE_TAG_VIEW': {
            console.log(action.type)
            return hideTagView(state, action);
        }
        default:
            return state;
    }
}